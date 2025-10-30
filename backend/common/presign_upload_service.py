import os, uuid, json, threading, time

# 移除代理影响，确保本地/容器内直连 S3 端点
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
os.environ['NO_PROXY'] = '127.0.0.1,localhost,::1,minio,s3.amazonaws.com'
from typing import Dict, List, Tuple
from pydantic import BaseModel
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException

# ---- 环境与默认参数（容器中通过环境变量覆盖） ----
def _get_minio_config():
    """动态获取 MinIO 配置，支持生产环境"""
    # 确保生产环境变量已注入
    if os.getenv("APP_ENV") == "prod" and not os.getenv("MINIO_ACCESS_KEY"):
        try:
            import sys
            sys.path.append(os.path.dirname(__file__) + "/..")
            import importlib.util
            spec = importlib.util.spec_from_file_location("env_prod", os.path.join(os.path.dirname(__file__), "..", ".env.prod.py"))
            env_prod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(env_prod)
            # inject_env() 已自动调用
        except Exception as e:
            print(f"Warning: Failed to load .env.prod.py: {e}")
    
    # 优先使用环境变量
    endpoint = os.getenv("MINIO_ENDPOINT", "http://127.0.0.1:9000")
    # 本地开发环境使用HTTP，生产环境通过环境变量设置HTTPS
    # 不再强制转换，避免本地开发时SSL错误
    return {
        'endpoint': endpoint,
        'access_key': os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        'secret_key': os.getenv("MINIO_SECRET_KEY", "minioadmin"),
        'bucket': os.getenv("MINIO_BUCKET", "mgsdb"),
    }

_config = _get_minio_config()
MINIO_ENDPOINT   = _config['endpoint']
MINIO_ACCESS_KEY = _config['access_key']
MINIO_SECRET_KEY = _config['secret_key']
MINIO_BUCKET     = _config['bucket']
PUBLIC_BASE_URL  = os.getenv("MINIO_PUBLIC_BASE_URL", MINIO_ENDPOINT)
URL_EXPIRE_SEC   = int(os.getenv("MINIO_URL_EXPIRE_SEC", "3600"))
RECOMMENDED_PART = int(os.getenv("MINIO_RECOMMENDED_PART", str(16*1024*1024)))
RECOMMENDED_CONC = int(os.getenv("MINIO_RECOMMENDED_CONC", "8"))

# 全局S3客户端，使用惰性初始化和健康检查
global _s3
_s3 = None

def _get_healthy_s3():
    """获取健康的S3客户端，自动检查连接并在必要时重新创建"""
    global _s3
    # 如果客户端已存在但测试连接失败，重新创建客户端
    if _s3 is not None:
        try:
            # 简单测试连接是否有效
            _s3.list_buckets()
            return _s3
        except Exception as e:
            print(f"S3客户端连接测试失败，重新创建客户端: {str(e)}")
            _s3 = None
    
    # 重新创建客户端，添加重试配置
    try:
        # 创建配置对象，增加重试策略
        config = Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            retries={
                'max_attempts': 5,
                'mode': 'adaptive'
            }
        )
        
        _s3 = boto3.client(
            "s3",
            endpoint_url=MINIO_ENDPOINT,
            aws_access_key_id=MINIO_ACCESS_KEY,
            aws_secret_access_key=MINIO_SECRET_KEY,
            region_name="us-east-1",
            config=config,
        )
        
        # 验证连接
        _s3.list_buckets()
        print(f"成功创建S3客户端并验证连接")
    except Exception as e:
        print(f"初始化S3客户端失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize S3 client: {str(e)}")
    
    return _s3

# 懒加载S3客户端
_s3 = None

def get_s3_client():
    """获取S3客户端，如果未初始化则尝试初始化"""
    global _s3
    if _s3 is None:
        try:
            _s3 = _get_healthy_s3()
        except Exception as e:
            print(f"警告: 无法初始化S3客户端: {str(e)}")
            print("服务将继续运行，但文件上传功能可能不可用")
            _s3 = None
    return _s3

def _lazy_ensure_bucket():
    """Only ensure bucket when service first used. Avoid crashing on import.
    Controlled by MINIO_AUTO_CREATE_BUCKET (default 0)."""
    if os.getenv("MINIO_AUTO_CREATE_BUCKET", "0") != "1":
        return
    # 使用S3客户端
    s3 = get_s3_client()
    if not s3:
        return
    try:
        s3.head_bucket(Bucket=MINIO_BUCKET)
        return
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code") if hasattr(e, "response") else "?"
        print(f"检查桶状态: code={code}, error={str(e)}")
        # Only attempt create if not forbidden
        if code in {"403", "AccessDenied"}:
            import logging
            logging.getLogger("minio").warning(f"bucket access forbidden, skip create bucket={MINIO_BUCKET} code={code}")
            return
        try:
            # 使用S3客户端创建桶
            if s3:
                s3.create_bucket(Bucket=MINIO_BUCKET)
            print(f"成功创建桶: {MINIO_BUCKET}")
        except ClientError as e2:
            import logging
            logging.getLogger("minio").warning(f"bucket create failed bucket={MINIO_BUCKET} err={e2}")
            print(f"创建桶失败: {str(e2)}")

class UploadSession(BaseModel):
    bucket: str
    key: str
    upload_id: str

class InMemorySessionStore:
    """内存存储会话，仅适用于单实例部署"""
    def __init__(self) -> None:
        self._lock = threading.Lock()
        # 存储结构: {session_id: {session: UploadSession, created_at: float, last_accessed: float}}
        self._map: Dict[str, Dict] = {}
        self._session_timeout = 3600  # 会话超时时间，单位秒

    def create(self, sess: UploadSession) -> str:
        sid = uuid.uuid4().hex
        current_time = time.time()
        with self._lock:
            self._map[sid] = {
                'session': sess,
                'created_at': current_time,
                'last_accessed': current_time
            }
        print(f"DEBUG: Created session {sid} for key {sess.key}")
        return sid

    def get(self, sid: str) -> UploadSession:
        with self._lock:
            entry = self._map.get(sid)
        if not entry:
            print(f"DEBUG: Session {sid} not found, available sessions: {list(self._map.keys())}")
            raise HTTPException(404, "session not found")
        # 更新访问时间
        with self._lock:
            entry['last_accessed'] = time.time()
        print(f"DEBUG: Retrieved session {sid} for key {entry['session'].key}")
        return entry['session']

    def delete(self, sid: str) -> None:
        with self._lock:
            if sid in self._map:
                del self._map[sid]
                print(f"DEBUG: Deleted session {sid}")
            else:
                print(f"DEBUG: Session {sid} not found for deletion")
    
    def cleanup_expired(self) -> None:
        """清理过期的会话"""
        current_time = time.time()
        expired_sessions = []
        
        with self._lock:
            for sid, entry in self._map.items():
                # 检查是否过期（基于创建时间或最后访问时间）
                last_time = entry.get('last_accessed', entry['created_at'])
                if current_time - last_time > self._session_timeout:
                    expired_sessions.append(sid)
            
            # 删除过期会话
            for sid in expired_sessions:
                del self._map[sid]
        
        if expired_sessions:
            print(f"清理了 {len(expired_sessions)} 个过期会话")
            # 可选：中止对应的分片上传
            for sid in expired_sessions:
                try:
                    # 注意：这里在锁外，无法直接访问entry，所以尝试重新获取健康的S3客户端
                    s3 = _get_healthy_s3()
                    # 但由于entry已删除，无法获取sess信息，只能记录日志
                    print(f"过期会话 {sid} 已删除，建议在实际使用时先记录会话信息再清理")
                except Exception as e:
                    print(f"记录过期上传会话失败 {sid}: {str(e)}")

class PresignUploadService:
    """预签名并行分片上传的业务逻辑"""
    def __init__(self, s3_client=None, session_store=None):
        self.s3 = s3_client or get_s3_client()  # 使用懒加载的客户端
        self.sessions = session_store or InMemorySessionStore()
        # 确保桶存在（如果配置允许）
        _lazy_ensure_bucket()
        # 添加会话超时清理线程
        self._start_cleanup_thread()
    
    def _start_cleanup_thread(self):
        """启动会话清理线程"""
        def cleanup_task():
            while True:
                try:
                    if hasattr(self.sessions, 'cleanup_expired'):
                        self.sessions.cleanup_expired()
                except Exception as e:
                    print(f"会话清理任务异常: {str(e)}")
                # 每5分钟清理一次
                threading.Event().wait(300)
        
        thread = threading.Thread(target=cleanup_task, daemon=True)
        thread.start()
        print("会话清理线程已启动")

    @staticmethod
    def _public_url(bucket: str, key: str) -> str:
        return f"{PUBLIC_BASE_URL.rstrip('/')}/{bucket}/{key}"

    @staticmethod
    def _expand_part_numbers(expr: str) -> List[int]:
        out: List[int] = []
        for tok in expr.split(","):
            tok = tok.strip()
            if not tok:
                continue
            if "-" in tok:
                a, b = tok.split("-", 1)
                a, b = int(a), int(b)
                if a > b:
                    a, b = b, a
                out.extend(range(a, b + 1))
            else:
                out.append(int(tok))
        return sorted(set(out))

    # ---- 业务方法 ----
    def _setup_cors_if_needed(self):
        """设置CORS规则，允许跨域请求"""
        if not self.s3:
            print("警告: S3客户端不可用，跳过CORS配置")
            return
        try:
            # 检查是否已有CORS配置
            cors_config = self.s3.get_bucket_cors(Bucket=MINIO_BUCKET)
            # 检查是否已包含所需的源
            allowed_origins = set()
            for rule in cors_config.get('CORSRules', []):
                allowed_origins.update(rule.get('AllowedOrigins', []))
            
            # 所需的源 - 添加生产环境和可能的测试环境
            required_origins = ['https://mgsdb.sjtu.edu.cn', 'https://test.mgsdb.sjtu.edu.cn']
            needs_update = False
            
            for origin in required_origins:
                if origin not in allowed_origins:
                    needs_update = True
                    break
            
            if not needs_update:
                return
                
        except ClientError as e:
            # 如果没有CORS配置，需要创建
            error_code = e.response.get('Error', {}).get('Code')
            if error_code != 'NoSuchCORSConfiguration':
                print(f"DEBUG: Error checking CORS configuration: {e}")
                return
        
        try:
            # 设置CORS配置
            cors_rules = [
                {
                    'AllowedOrigins': ['https://mgsdb.sjtu.edu.cn', 'https://test.mgsdb.sjtu.edu.cn'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    'AllowedHeaders': ['*'],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3600
                }
            ]
            self.s3.put_bucket_cors(Bucket=MINIO_BUCKET, CORSConfiguration={'CORSRules': cors_rules})
            print(f"DEBUG: CORS configuration updated for bucket {MINIO_BUCKET}")
        except ClientError as e:
            print(f"DEBUG: Failed to update CORS configuration: {e}")
    
    def init(self, filename: str, content_type: str | None, object_prefix: str | None):
        if not filename:
            raise HTTPException(400, "filename required")
        prefix = (object_prefix or "").strip("/ ")
        key = f"{uuid.uuid4().hex}__{os.path.basename(filename)}"
        if prefix:
            key = f"{prefix}/{key}"
        try:
            # 确保CORS配置正确
            self._setup_cors_if_needed()
            
            print(f"DEBUG: Using MINIO_ACCESS_KEY={MINIO_ACCESS_KEY}, MINIO_ENDPOINT={MINIO_ENDPOINT}, MINIO_BUCKET={MINIO_BUCKET}")
            # 使用S3客户端
            s3 = get_s3_client()
            if not s3:
                raise HTTPException(500, "S3 client not available")
            resp = s3.create_multipart_upload(
                Bucket=MINIO_BUCKET,
                Key=key,
                ContentType=content_type or "application/octet-stream",
            )
        except ClientError as e:
            raise HTTPException(500, f"create_multipart_upload failed: {e}")
        upload_id = resp["UploadId"]
        sid = self.sessions.create(UploadSession(bucket=MINIO_BUCKET, key=key, upload_id=upload_id))
        return {
            "session_id": sid,
            "bucket": MINIO_BUCKET,
            "key": key,
            "upload_id": upload_id,
            "recommendations": {"part_size": RECOMMENDED_PART, "concurrency": RECOMMENDED_CONC},
        }

    def sign(self, session_id: str, part_numbers: str):
        if not session_id or not part_numbers:
            raise HTTPException(400, "session_id and part_numbers required")
        
        try:
            sess = self.sessions.get(session_id)
        except HTTPException as e:
            if e.status_code == 404:
                # 对于已取消的上传，session可能已被删除，此时直接返回空结果
                # 这样前端可以更优雅地处理取消操作，而不是收到404错误
                print(f"DEBUG: Session {session_id} not found for sign, likely cancelled")
                # 返回一个空的parts列表，但保持响应格式一致
                return {"session_id": session_id, "upload_id": "", "parts": []}
            raise
            
        parts = self._expand_part_numbers(part_numbers)
        if not parts:
            raise HTTPException(400, "no valid part numbers")

        out = []
        for pn in parts:
            try:
                # 使用S3客户端
                s3 = get_s3_client()
                if not s3:
                    raise HTTPException(500, "S3 client not available")
                url = s3.generate_presigned_url(
                    ClientMethod="upload_part",
                    Params={
                        "Bucket": sess.bucket,
                        "Key": sess.key,
                        "UploadId": sess.upload_id,
                        "PartNumber": pn,
                    },
                    ExpiresIn=URL_EXPIRE_SEC,
                )
            except ClientError as e:
                raise HTTPException(500, f"presign upload_part failed for part {pn}: {e}")
            out.append({"part_number": pn, "url": url, "method": "PUT"})
        return {"session_id": session_id, "upload_id": sess.upload_id, "parts": out}

    def list_parts(self, session_id: str):
        sess = self.sessions.get(session_id)
        try:
            # 使用S3客户端
            s3 = get_s3_client()
            if not s3:
                raise HTTPException(500, "S3 client not available")
            # 如需大文件，生产应按 NextPartNumberMarker 翻页
            listed = s3.list_parts(Bucket=sess.bucket, Key=sess.key, UploadId=sess.upload_id)
            parts = [{"PartNumber": p["PartNumber"], "ETag": p["ETag"].strip('"'), "Size": p.get("Size")} for p in listed.get("Parts", [])]
        except ClientError as e:
            raise HTTPException(500, f"list_parts failed: {e}")
        return {"session_id": session_id, "parts": parts}

    def complete(self, session_id: str, parts_json: str):
        sess = self.sessions.get(session_id)
        try:
            body = json.loads(parts_json)
            norm = [{"PartNumber": int(p["PartNumber"]), "ETag": str(p["ETag"]).strip('"')} for p in body["parts"]]
            norm.sort(key=lambda x: x["PartNumber"])
            # 使用S3客户端
            s3 = get_s3_client()
            if not s3:
                raise HTTPException(500, "S3 client not available")
            s3.complete_multipart_upload(
                Bucket=sess.bucket,
                Key=sess.key,
                UploadId=sess.upload_id,
                MultipartUpload={"Parts": norm},
            )
        except ClientError as e:
            raise HTTPException(500, f"complete_multipart_upload failed: {e}")
        finally:
            self.sessions.delete(session_id)
        return {"bucket": sess.bucket, "key": sess.key, "url": self._public_url(sess.bucket, sess.key)}

    def upload_part(self, session_id: str, part_number: int, file_data: bytes, content_type: str = 'application/octet-stream'):
        """通过后端直接上传分片文件数据"""
        print(f"PresignUploadService.upload_part(session_id={session_id}, part_number={part_number})")
        try:
            session = self.sessions.get(session_id)
            if not session:
                print(f"会话不存在: {session_id}")
                raise Exception("Session not found")
            
            # 使用S3客户端
            s3 = get_s3_client()
            if not s3:
                raise Exception("S3 client not available")
            # 添加重试机制
            max_retries = 3
            retry_count = 0
            while retry_count < max_retries:
                try:
                    # 直接上传文件数据到对象存储
                    response = s3.upload_part(
                        Bucket=session.bucket,
                        Key=session.key,
                        UploadId=session.upload_id,
                        PartNumber=part_number,
                        Body=file_data,
                        ContentType=content_type
                    )
                    break  # 成功则退出循环
                except Exception as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        raise
                    wait_time = 1 * (2 ** (retry_count - 1))  # 指数退避
                    print(f"分片上传失败，第 {retry_count} 次重试，等待 {wait_time} 秒: {str(e)}")
                    time.sleep(wait_time)
            
            etag = response.get('ETag', '').strip('"')
            print(f"分片上传成功: part_number={part_number}, etag={etag}")
            return {
                "success": True,
                "part_number": part_number,
                "etag": etag
            }
        except Exception as e:
            print(f"分片上传失败: {str(e)}")
            raise
    
    def abort(self, session_id: str):
        try:
            sess = self.sessions.get(session_id)
        except HTTPException as e:
            if e.status_code == 404:
                print(f"DEBUG: Session {session_id} not found for abort, ignoring")
                return {"ok": True}
            raise
        try:
            # 使用S3客户端
            s3 = get_s3_client()
            if not s3:
                return {"ok": True}  # 如果客户端不可用，也视为成功中止（避免服务崩溃）
            s3.abort_multipart_upload(Bucket=sess.bucket, Key=sess.key, UploadId=sess.upload_id)
        except ClientError as e:
            raise HTTPException(500, f"abort_multipart_upload failed: {e}")
        self.sessions.delete(session_id)
        return {"ok": True}
