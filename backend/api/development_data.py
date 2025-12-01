from fastapi import Depends, HTTPException, APIRouter, UploadFile, File
import urllib.parse
from botocore.exceptions import ClientError
import threading

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import warnings, json

from database import template_crud, development_data_crud, models, schemas
from database.base import SessionLocal, engine
from common import object_store_service, error, constants, status, utils, auth
from data_parser import web_submit
import uvicorn
from common import db
import config
import io, mimetypes, asyncio
import uuid
import io
from minio import Minio
from minio.error import S3Error
from minio.commonconfig import CopySource
import os
import logging
import traceback
from typing import Optional, Dict, Any, Iterable, Set
from fastapi import APIRouter, Form, HTTPException
from common.presign_upload_service import PresignUploadService, InMemorySessionStore, UploadSession
from common.object_store_service import _get_s3
import boto3
from botocore.exceptions import ClientError
import time

# 全局上传会话管理
active_uploads: Dict[str, Dict[str, Any]] = {}
# 用于保护active_uploads的互斥锁
active_uploads_lock = threading.Lock()

# MinIO配置 - 移至文件底部统一配置

# 全局S3客户端实例
_s3_client = None

def _get_healthy_s3():
    global _s3_client
    if _s3_client is not None:
        logger.info("使用已初始化的S3客户端")
        return _s3_client
    
    try:
        # 读取环境变量，与MinIO客户端保持一致的默认配置
        endpoint_url = os.environ.get('MINIO_ENDPOINT_URL', MINIO_ENDPOINT_FULL)
        access_key = os.environ.get('MINIO_ACCESS_KEY', MINIO_ACCESS_KEY)
        secret_key = os.environ.get('MINIO_SECRET_KEY', MINIO_SECRET_KEY)
        region = os.environ.get('MINIO_REGION', 'us-east-1')
        # 正确处理use_ssl配置，确保默认值是字符串类型或直接使用布尔值
        ssl_default = MINIO_ENDPOINT_FULL.startswith("https://")
        # 如果环境变量存在，尝试解析为布尔值；否则使用默认值
        if 'MINIO_USE_SSL' in os.environ:
            use_ssl = os.environ.get('MINIO_USE_SSL').lower() == 'true'
        else:
            use_ssl = ssl_default
        
        logger.info(f"初始化S3客户端: endpoint={endpoint_url}, region={region}, ssl={use_ssl}")
        logger.info(f"使用的AccessKey: {access_key[:3]}{'*' * (len(access_key) - 3)}")  # 安全记录access key，只显示前3个字符
        
        # 创建S3客户端
        _s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            use_ssl=use_ssl,
            config=boto3.session.Config(signature_version='s3v4')
        )
        
        # 测试连接
        try:
            logger.info("测试S3连接...")
            _s3_client.list_buckets()
            logger.info("S3连接测试成功")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f"S3连接测试失败: {error_code} - {str(e)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            _s3_client = None
            
            # 根据错误类型提供更具体的错误信息
            if error_code == 'InvalidAccessKeyId' or error_code == 'SignatureDoesNotMatch':
                logger.error("S3认证错误，可能是AccessKey或SecretKey不正确")
                raise HTTPException(status_code=500, detail="S3 authentication error. Please check MINIO_ACCESS_KEY and MINIO_SECRET_KEY.")
            elif error_code == 'AccessDenied':
                logger.error("S3访问禁止错误，可能是用户权限不足或MinIO策略配置问题")
                raise HTTPException(status_code=500, detail="S3 access denied. Please check bucket permissions and MinIO policies.")
            elif error_code == 'ConnectionError' or 'timed out' in str(e) or 'connect' in str(e):
                logger.error("无法连接到S3端点，可能是MinIO服务未运行或网络问题")
                raise HTTPException(status_code=500, detail=f"Cannot connect to S3 endpoint: {endpoint_url}. Please check MINIO_ENDPOINT_URL and that MinIO service is running.")
            else:
                raise HTTPException(status_code=500, detail=f"Failed to connect to S3: {error_code} - {str(e)}")
        
        return _s3_client
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建S3客户端失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        _s3_client = None
        raise HTTPException(status_code=500, detail=f"Failed to initialize S3 client: {str(e)}")

# 配置日志，确保能打印到文件
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# 检查是否已经有处理器，如果没有则添加
if not logger.handlers:
    # 创建控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # 创建文件处理器，确保日志可以打印
    try:
        file_handler = logging.FileHandler('upload_logs.log', encoding='utf-8')
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
        logger.info("日志文件处理器初始化成功")
    except Exception as e:
        logger.warning(f"无法创建日志文件: {e}，将仅使用控制台输出")


router = APIRouter()


DOWNLOAD_URL_PREFIX = "/api/download/"


def _maybe_extract_object_key(value: Any) -> Optional[str]:
    """从任意值中提取 MinIO 对象 key。

    支持如下格式：
    - 直接的下载路径，如 "/api/download/<key>"
    - 含有域名的 URL，只要 path 中包含上述下载前缀
    - legacy 的 "file:<name>:<key>" 表达
    返回去除前导斜线后的对象 key；无法解析时返回 None。
    """

    if isinstance(value, str):
        candidate = value.strip()
        if not candidate:
            return None

        # 优先处理显式下载前缀
        if DOWNLOAD_URL_PREFIX in candidate:
            # 如果是完整 URL，截取 path 部分
            parsed = urllib.parse.urlparse(candidate)
            path = parsed.path or candidate
            idx = path.find(DOWNLOAD_URL_PREFIX)
            if idx >= 0:
                candidate = path[idx + len(DOWNLOAD_URL_PREFIX) :]
        elif candidate.startswith("file:"):
            parts = candidate.split(":", 2)
            if len(parts) == 3:
                candidate = parts[2]
            else:
                return None
        else:
            return None

        candidate = urllib.parse.unquote(candidate).lstrip("/")
        return candidate or None

    return None


def _collect_object_keys(payload: Any) -> Set[str]:
    keys: Set[str] = set()

    if isinstance(payload, dict):
        for item in payload.values():
            keys.update(_collect_object_keys(item))
    elif isinstance(payload, list):
        for item in payload:
            keys.update(_collect_object_keys(item))
    else:
        maybe_key = _maybe_extract_object_key(payload)
        if maybe_key:
            keys.add(maybe_key)

    return keys


def _delete_minio_objects(object_keys: Iterable[str]) -> None:
    """尝试删除 MinIO 中的对象，删除失败会记录日志但不会中断流程。"""

    attempted: Set[str] = set()

    for raw_key in object_keys:
        if not raw_key:
            continue

        candidates = [raw_key]
        # 兼容历史：有些对象在 uploads/ 前缀下存储
        if not raw_key.startswith("uploads/"):
            candidates.append(f"uploads/{raw_key}")

        deleted = False
        for candidate in candidates:
            if candidate in attempted:
                continue

            attempted.add(candidate)
            try:
                client.remove_object(MINIO_BUCKET, candidate)
                logger.info(f"Deleted MinIO object: bucket={MINIO_BUCKET}, key={candidate}")
                deleted = True
                break
            except S3Error as exc:
                if exc.code == "NoSuchKey":
                    logger.info(
                        f"MinIO object already missing: bucket={MINIO_BUCKET}, key={candidate}"
                    )
                    continue
                logger.warning(
                    "Failed to delete MinIO object %s: %s", candidate, exc, exc_info=True
                )
            except Exception:
                logger.exception(
                    "Unexpected error while deleting MinIO object %s", candidate
                )

        if not deleted:
            logger.debug(
                "No MinIO object removed for key '%s' (all candidates failed)", raw_key
            )


@router.post("/api/development_data/web_submit")
def create_data_object_web_submit(
    data: schemas.DataCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    (
        json_data,
        ERROR,
        cutorm_field,
    ) = utils.generate_development_json_data(data=data, db=db)

    if json_data is None:
        return ERROR

    json_data = utils.initialize_data_metadata(
        json_data, cutorm_field, current_user.user_name, db
    )
    # Removed legacy object store write (DB only)
    development_data_create = development_data_crud.get_create_development_data(
        json_data, data.template_id, db
    )
    if development_data_create is None:
        warnings.warn("Warning: Unable to create the development data object.")
        return {
            "status": status.API_ERR_DB_FAILED,
            "message": "Unable to create the development data object",
        }
    return {"status": status.API_OK, "data": development_data_create}


@router.post("/api/update_development_data/{object_id}")
def update_development_data(
    object_id: str,
    data: schemas.DataCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    (
        json_data,
        ERROR,
        cutorm_field,
    ) = utils.generate_development_json_data(data=data, db=db)

    if json_data is None:
        return ERROR

    old_dev_data = development_data_crud.get_dev_data(db, object_id)
    if (
        old_dev_data.json_data["review_status"] == constants.REVIEW_STATUS_PASSED_REVIEW
        or old_dev_data.json_data["review_status"]
        == constants.REVIEW_STATUS_PASSED_REVIEW_PREVIEW
    ):
        json_data = utils.initialize_data_metadata(
            json_data, cutorm_field, current_user.user_name, db
        )
        development_data_crud.deprecate_dev_data(db, object_id)
    # Removed object store write
        development_data_create = development_data_crud.get_create_development_data(
            json_data, data.template_id, db
        )
        return {"status": status.API_OK, "data": development_data_create}
    else:
        json_data = utils.update_data_metadata(
            json_data, old_dev_data.json_data, current_user.user_name
        )
    # Removed object store write
        development_data_crud.update_development_data(
            json_data, data.template_id, db, object_id
        )
        return {"status": status.API_OK}


@router.post("/api/development_data/sample_search")
def get_sample_list(
    data: schemas.SampleDataQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    post_data = json.loads(data.json_data)
    sample_search_result = development_data_crud.get_data_list_by_type(
        post_data,
        data.template_id,
        data.template_name,
        "sample",
        data.start,
        data.size,
        db,
    )
    return sample_search_result


@router.post("/api/development_data/related_data_search")
def get_related_data(
    data: schemas.RelatedDataQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    related_data = development_data_crud.get_related_data(
        data.template_id, data.sample_MGID, data.start, data.size, db
    )
    return related_data


@router.post("/api/dev_data_list")
def get_dev_data_list(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    if query.status_filter == "all":
        db_dev_data_list = development_data_crud.get_dev_data_list(
            db=db,
            user=current_user.user_name,
            start=query.start,
            size=query.size,
        )
    else:
        db_dev_data_list = development_data_crud.filter_dev_data_list(
            db=db,
            user=current_user.user_name,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_dev_data_list}


@router.post("/api/dev_data_count")
def get_dev_data_count(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    if query.status_filter == "all":
        count = development_data_crud.get_dev_data_count(
            db=db,
            user=current_user.user_name,
        )
    else:
        count = development_data_crud.filter_dev_data_count(
            db=db,
            user=current_user.user_name,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/delete_dev_data/{object_id}")
def delete_dev_data(
    object_id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    # 作者校验
    existing = development_data_crud.get_dev_data(db, object_id)
    if not existing:
        return {"status": status.API_INVALID_PARAMETER, "message": "dev data not found"}
    if existing.json_data.get("author") and existing.json_data.get("author") != current_user.user_name:
        return {"status": status.API_PERMISSION_DENIED}
    try:
        object_keys = _collect_object_keys(existing.json_data)
        if object_keys:
            logger.info(
                "Deleting %d MinIO object(s) linked to dev data %s", len(object_keys), object_id
            )
            _delete_minio_objects(object_keys)
    except Exception:
        logger.exception("Failed to delete associated MinIO objects for dev data %s", object_id)
    development_data_crud.delete_dev_data(db=db, id=object_id)
    return {"status": status.API_OK}


@router.get("/api/dev_data/{object_id}")
def read_dev_data(
    object_id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    db_dev_data = development_data_crud.get_dev_data(db, object_id=object_id)
    if db_dev_data is None:
        raise HTTPException(status_code=404, detail="Development data not found")
    # 统一返回格式
    return {"status": status.API_OK, "data": {"id": str(db_dev_data.id), "template_id": str(db_dev_data.template_id), "json_data": db_dev_data.json_data}}


## Removed /api/get_file endpoint (object storage deprecated)


@router.post("/api/devlopment_data_apply_published/{object_id}")
def apply_published(
    object_id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_template_id = str(
        db.query(models.Object)
        .filter(models.Object.id == object_id)
        .first()
        .template_id
    )
    template_review_status = template_crud.get_templates_review_status_with_id(
        id=current_template_id, db=db
    )
    current_review_status = (
        development_data_crud.get_development_data_review_status_with_id(
            id=object_id, db=db
        )
    )
    if current_review_status == constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED:
        development_data_crud.change_review_state(
            db=db, id=object_id, review_status=template_review_status
        )
    else:
        return {"status": status.API_INVALID_PARAMETER}
    return {"status": status.API_OK}

# MinIO 配置（优先环境变量，便于容器网络）
MINIO_ENDPOINT_FULL = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
# 移除协议前缀用于 Minio 客户端
MINIO_ENDPOINT = MINIO_ENDPOINT_FULL.replace("http://", "").replace("https://", "")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
# 统一的存储桶配置，使用正确的默认值
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "mgsdb")  # 使用与client初始化相同的默认值

client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_ENDPOINT_FULL.startswith("https://")
)

# 公共基础URL，用于生成可访问的文件URL
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", MINIO_ENDPOINT_FULL)

# 用于跟踪正在进行的分片上传
active_uploads = {}  # 结构: {session_id: {session: UploadSession, created_at: float, user_id: str}}
# 线程锁，确保active_uploads字典的线程安全
active_uploads_lock = threading.Lock()

# 添加会话过期清理机制
def cleanup_expired_uploads():
    """清理过期的上传会话，防止内存泄漏"""
    current_time = time.time()
    expired_sessions = []
    
    with active_uploads_lock:
        for session_id, upload_info in active_uploads.items():
            # 检查会话是否超过3小时
            if 'created_at' not in upload_info:
                upload_info['created_at'] = current_time
            elif current_time - upload_info['created_at'] > 3 * 3600:
                expired_sessions.append(session_id)
    
    for session_id in expired_sessions:
        upload_info = None
        with active_uploads_lock:
            if session_id in active_uploads:
                upload_info = active_uploads[session_id]
        
        try:
            if upload_info:
                _s3 = _get_s3()
                if _s3 is not None and 'upload_id' in upload_info and 'object_key' in upload_info:
                    _s3.abort_multipart_upload(
                        Bucket=MINIO_BUCKET,
                        Key=upload_info['object_key'],
                        UploadId=upload_info['upload_id']
                    )
        except Exception as e:
            logger.error(f"清理过期会话时中止上传失败: {str(e)}")
        finally:
            with active_uploads_lock:
                if session_id in active_uploads:
                    del active_uploads[session_id]

# 导入time模块
import time

# 导入需要的模块
import uuid
import time

svc = PresignUploadService()


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        logger.debug(f"Starting upload for file: {file.filename}, size: {file.size}, content_type: {file.content_type}")
        ext = file.filename.split('.')[-1] if '.' in file.filename else ''
        filename = f"{uuid.uuid4().hex}.{ext}"
        logger.debug(f"Generated filename: {filename}")
        data = await file.read()
        logger.debug(f"Read {len(data)} bytes of data")

        logger.debug(f"Using MinIO config - endpoint: {MINIO_ENDPOINT}, bucket: {MINIO_BUCKET}, secure: {MINIO_ENDPOINT_FULL.startswith('https://')}")
        client.put_object(
            MINIO_BUCKET,
            filename,
            data=io.BytesIO(data),
            length=len(data),
            content_type=file.content_type
        )
        logger.debug(f"Successfully uploaded to MinIO: {filename}")
        # 统一返回下载代理 + key + bucket
        download_url = f"/api/download/{filename}"
        logger.debug(f"Returning download_url: {download_url}")
        return {"file_url": download_url, "key": filename, "bucket": MINIO_BUCKET}
    
    except Exception as e:
        logger.error(f"Upload failed with exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/download/{filename}")
def download_file(filename: str):
    try:
        # 验证文件名有效性
        if not filename or len(filename.strip()) == 0:
            raise HTTPException(status_code=400, detail="文件名不能为空")
        
        # 清理无效字符或格式
        # 移除URL编码字符如%3A（冒号）
        import urllib.parse
        clean_filename = urllib.parse.unquote(filename)
        
        # 基本的文件名安全检查
        if clean_filename.startswith('.') and not clean_filename.startswith('./'):
            # 处理以.开头的文件名，确保它不是仅由扩展名组成
            if clean_filename.count('.') == 1 and not clean_filename.split('.')[0]:
                raise HTTPException(status_code=400, detail="无效的文件名格式")
        
        # 从 MinIO 获取对象
        response = client.get_object(MINIO_BUCKET, clean_filename)
        return StreamingResponse(response, media_type="application/octet-stream", headers={
            "Content-Disposition": f"attachment; filename={clean_filename}"
        })
    except S3Error as e:
        logger.error(f"文件下载失败: {clean_filename} - S3错误: {str(e)}")
        raise HTTPException(status_code=404, detail="文件未找到")
    except HTTPException:
        # 重新抛出已经处理的HTTP异常
        raise
    except Exception as e:
        logger.error(f"文件下载失败: {filename} - 异常: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"下载失败: {str(e)}")


@router.delete("/api/delete_file/{file_path:path}")
def delete_file(file_path: str, current_user: models.User = Depends(auth.get_current_active_user)):
    """删除对象

    兼容: 之前只支持无目录文件名，现在允许携带前缀 (例如 development_data/uuid__name.ext)。
    """
    # 完整记录请求信息用于调试
    logger.info(f"接收到删除请求: file_path={file_path}, user={current_user.user_name}")
    
    try:
        # 规范化文件路径，确保格式正确
        # 先去除首尾空白，再处理斜杠
        cleaned_path = file_path.strip()
        normalized = cleaned_path.lstrip('/')
        logger.info(f"原始路径: {file_path}, 清理后: {cleaned_path}, 规范化后: {normalized}")
        
        # 直接使用与上传相同的MINIO_BUCKET配置，确保一致
        bucket_to_use = MINIO_BUCKET  # 使用文件顶部定义的全局MINIO_BUCKET变量
        logger.info(f"使用的存储桶: {bucket_to_use}")
        
        # 尝试使用不同的客户端方式，与上传保持一致
        # 首先尝试使用与上传相同的client对象
        try:
            # 检查文件是否存在
            logger.info(f"使用直接client验证文件是否存在: bucket={bucket_to_use}, key={normalized}")
            stat = client.stat_object(bucket_to_use, normalized)
            logger.info(f"文件存在，可以执行删除操作: {stat}")
            
            # 执行删除操作
            logger.info(f"使用直接client执行删除操作: bucket={bucket_to_use}, key={normalized}")
            client.remove_object(bucket_to_use, normalized)
            logger.info(f"删除操作完成")
            
            # 删除后验证
            try:
                client.stat_object(bucket_to_use, normalized)
                logger.error(f"删除失败: 文件仍然存在: {normalized}")
                raise HTTPException(status_code=500, detail="文件删除失败: 文件仍然存在")
            except S3Error as e:
                if e.code == "NoSuchKey":
                    logger.info(f"文件删除成功: {normalized}")
                    return {"status": status.API_OK, "key": normalized}
                else:
                    logger.error(f"验证删除结果时出错: {e.code} - {str(e)}")
                    raise HTTPException(status_code=500, detail=f"验证删除结果失败: {e.code}")
        except S3Error as e:
            logger.info(f"使用直接client验证失败: {e.code} - {str(e)}")
            
            # 如果直接client失败，尝试使用_s3客户端
            _s3 = _get_s3()
            if _s3 is None:
                logger.error("无法初始化S3客户端")
                raise HTTPException(status_code=500, detail="Failed to initialize S3 client")
            
            # 尝试查找可能匹配的文件
            logger.info(f"尝试列出存储桶中的所有对象，查找可能的匹配")
            try:
                # 提取UUID部分用于搜索
                uuid_part = None
                if '_' in normalized:
                    uuid_part = normalized.split('_')[0]
                    logger.info(f"提取的UUID部分: {uuid_part}")
                
                # 列出存储桶中的所有对象
                response = _s3.list_objects_v2(Bucket=bucket_to_use)
                found_objects = []
                if 'Contents' in response:
                    found_objects = [obj['Key'] for obj in response['Contents']]
                    logger.info(f"找到{len(found_objects)}个对象")
                    
                    # 查找包含UUID部分的文件
                    if uuid_part:
                        matching_files = [obj for obj in found_objects if uuid_part in obj]
                        logger.info(f"找到{len(matching_files)}个匹配UUID的文件: {matching_files}")
                    else:
                        logger.info(f"UUID提取失败，使用完整文件名搜索")
                        matching_files = [obj for obj in found_objects if normalized in obj]
                        logger.info(f"找到{len(matching_files)}个匹配的文件: {matching_files}")
                    
                    # 如果找到匹配的文件，尝试删除第一个
                    if matching_files:
                        target_file = matching_files[0]
                        logger.info(f"尝试删除匹配的文件: {target_file}")
                        _s3.delete_object(Bucket=bucket_to_use, Key=target_file)
                        
                        # 验证删除
                        try:
                            _s3.head_object(Bucket=bucket_to_use, Key=target_file)
                            logger.error(f"删除匹配文件失败: {target_file}")
                        except ClientError as delete_err:
                            error_code = delete_err.response['Error']['Code']
                            if error_code == "404" or error_code == "NoSuchKey":
                                logger.info(f"匹配文件删除成功: {target_file}")
                                return {"status": status.API_OK, "key": target_file}
                else:
                    logger.info("存储桶中没有对象")
            except Exception as list_err:
                logger.error(f"列出对象时出错: {str(list_err)}")
            
            # 如果没有找到匹配的文件，抛出404
            logger.warning(f"文件不存在，无需删除: {normalized}")
            raise HTTPException(status_code=404, detail="文件未找到")
                
    except HTTPException:
        raise
    except S3Error as e:
        logger.error(f"删除文件时发生S3Error: {e.code} - {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"删除文件失败: {e.code} - {str(e)}")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"删除文件时发生ClientError: {error_code} - {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"删除文件失败: {error_code} - {str(e)}")
    except Exception as e:
        logger.error(f"删除文件时发生未知错误: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")


# handle_single_part_upload函数已被新的upload_part_direct实现替代

@router.post("/api/development_data/init_multipart")
async def init_multipart(
    filename: str = Form(...),
    content_type: str = Form("application/octet-stream"),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """初始化分片上传会话"""
    request_id = str(uuid.uuid4())[:8]
    timestamp_ms = int(time.time() * 1000)
    start_time = time.time()
    
    try:
        # 生成唯一的对象键
        object_key = f"uploads/{uuid.uuid4()}_{os.path.basename(filename)}"        
        # 初始化S3客户端
        _s3 = _get_s3()
        if _s3 is None:
            raise HTTPException(status_code=500, detail="Failed to initialize S3 client")
        
        response = _s3.create_multipart_upload(
            Bucket=MINIO_BUCKET,
            Key=object_key,
            ContentType=content_type
        )
        upload_id = response['UploadId']
        
        # 保存上传信息到active_uploads
        with active_uploads_lock:
            active_uploads[object_key] = {
                "upload_id": upload_id,
                "object_key": object_key,
                "parts": {},
                "user_id": current_user.user_name,
                "created_at": time.time(),
                "expected_total_parts": None
            }
        
        # 清理过期会话
        cleanup_expired_uploads()
        
        return {
            "upload_session": object_key,
            "upload_id": upload_id,
            "key": object_key
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to initialize upload session")

@router.post("/api/development_data/upload_part_direct")
async def upload_part_direct(
    file: UploadFile = File(...),
    part_number: int = Form(...),
    total_parts: int = Form(...),
    upload_session: str = Form(...),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """直接通过后端上传分片文件"""
    request_id = str(uuid.uuid4())[:8]
    timestamp_ms = int(time.time() * 1000)
    
    try:
        # 参数验证
        if part_number <= 0:
            raise HTTPException(status_code=422, detail="Part number must be greater than 0")
        if total_parts <= 0:
            raise HTTPException(status_code=422, detail="Total parts must be greater than 0")
        if part_number > total_parts:
            raise HTTPException(status_code=422, detail="Part number cannot exceed total parts")
        
        # 检查上传会话是否存在
        with active_uploads_lock:
            if upload_session not in active_uploads:
                raise HTTPException(status_code=400, detail="Invalid upload_session")
            
            session = active_uploads[upload_session]
            # 验证用户权限
            if session['user_id'] != current_user.user_name:
                raise HTTPException(status_code=403, detail="Permission denied")
            
            # 设置或验证总分片数
            if session.get("expected_total_parts") in (None, 0):
                session["expected_total_parts"] = total_parts
            elif session["expected_total_parts"] != total_parts:
                raise HTTPException(status_code=409, detail="total_parts mismatch for this session")
        
        # 读取文件数据
        file_data = await file.read()
        
        # 初始化S3客户端
        _s3 = _get_s3()
        if _s3 is None:
            raise HTTPException(status_code=500, detail="Failed to initialize S3 client")
        
        # 上传分片
        resp = _s3.upload_part(
            Bucket=MINIO_BUCKET,
            Key=upload_session,
            UploadId=session["upload_id"],
            PartNumber=part_number,
            Body=file_data
        )
        
        etag = resp["ETag"].strip('"')
        
        # 保存分片信息
        with active_uploads_lock:
            session = active_uploads[upload_session]
            session["parts"][part_number] = etag
            current_parts = len(session["parts"])
            expected_parts = session["expected_total_parts"]
        
        return {
            "success": True,
            "part_number": part_number,
            "completed": False,
            "upload_session": upload_session,
            "current_parts": current_parts,
            "total_parts": expected_parts
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Upload part failed")

@router.post("/api/development_data/complete_multipart")
async def complete_multipart(
    upload_session: str = Form(...),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """完成分片上传"""
    request_id = str(uuid.uuid4())[:8]
    timestamp_ms = int(time.time() * 1000)
    
    try:
        # 检查上传会话是否存在
        with active_uploads_lock:
            if upload_session not in active_uploads:
                raise HTTPException(status_code=400, detail="Invalid upload_session")
            
            session = active_uploads[upload_session].copy()
            # 验证用户权限
            if session['user_id'] != current_user.user_name:
                raise HTTPException(status_code=403, detail="Permission denied")
        
        # 检查是否所有分片都已上传
        current_parts = len(session["parts"])
        expected_parts = session["expected_total_parts"]
        
        if expected_parts is None or expected_parts == 0:
            raise HTTPException(status_code=400, detail="Total parts not set")
        
        if current_parts != expected_parts:
            raise HTTPException(
                status_code=400, 
                detail=f"Not all parts uploaded. Expected {expected_parts}, got {current_parts}"
            )
        
        # 初始化S3客户端
        _s3 = _get_s3()
        if _s3 is None:
            raise HTTPException(status_code=500, detail="Failed to initialize S3 client")
        
        # 准备完成上传
        etags = [{"ETag": f'"{etag}"', "PartNumber": pn} for pn, etag in sorted(session["parts"].items())]
        
        # 完成上传
        _s3.complete_multipart_upload(
            Bucket=MINIO_BUCKET,
            Key=upload_session,
            UploadId=session["upload_id"],
            MultipartUpload={"Parts": etags}
        )
        
        # 生成下载链接
        file_url = f"/api/download/{os.path.basename(upload_session)}"
        
        # 从active_uploads中移除会话
        with active_uploads_lock:
            if upload_session in active_uploads:
                del active_uploads[upload_session]
        
        return {
            "success": True,
            "completed": True,
            "file_url": file_url,
            "key": upload_session
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        # 尝试中止上传
        try:
            if 'session' in locals():
                _s3 = _get_s3()
                if _s3:
                    _s3.abort_multipart_upload(
                        Bucket=MINIO_BUCKET,
                        Key=upload_session,
                        UploadId=session["upload_id"]
                    )
                # 从active_uploads中移除会话
                with active_uploads_lock:
                    if upload_session in active_uploads:
                        del active_uploads[upload_session]
        except Exception as abort_e:
            pass
        raise HTTPException(status_code=500, detail="Complete upload failed")

def cleanup_expired_uploads():
    """清理过期的上传会话"""
    try:
        current_time = time.time()
        # 24小时过期
        expiration_time = 24 * 60 * 60
        
        expired_sessions = []
        
        with active_uploads_lock:
            for session_key, session_data in active_uploads.items():
                if current_time - session_data.get('created_at', 0) > expiration_time:
                    expired_sessions.append((session_key, session_data))
            
            # 移除过期会话
            for session_key, _ in expired_sessions:
                del active_uploads[session_key]
        
        # 异步中止过期的multipart上传
        _s3 = _get_s3()
        if _s3:
            for session_key, session_data in expired_sessions:
                try:
                    _s3.abort_multipart_upload(
                        Bucket=MINIO_BUCKET,
                        Key=session_key,
                        UploadId=session_data['upload_id']
                    )
                except Exception as e:
                    pass
    except Exception as e:
        pass

@router.post("/api/development_data/part_upload")
def part_upload(
    op: str = Form(...),
    # init
    filename: Optional[str] = Form(None),
    content_type: Optional[str] = Form(None),
    object_prefix: Optional[str] = Form(None),
    # sign/list/complete/abort/upload_part
    session_id: Optional[str] = Form(None),
    # sign
    part_numbers: Optional[str] = Form(None),
    # complete
    parts_json: Optional[str] = Form(None),
    # upload_part
    part_number: Optional[int] = Form(None),
):
    """分片上传相关接口
    op: init/sign/list/complete/abort
    """
    # 记录详细的请求信息，包括所有参数
    try:
        if op == "init":
            if not filename:
                raise HTTPException(422, "filename is required")
            result = {"op": "init", **svc.init(filename, content_type, object_prefix)}
            return result
        elif op == "sign":
            if not session_id or not part_numbers:
                raise HTTPException(422, "Missing required parameters")
            result = {"op": "sign", **svc.sign(session_id, part_numbers)}
            return result
        elif op == "list":
            if not session_id:
                raise HTTPException(422, "session_id is required")
            result = {"op": "list", **svc.list_parts(session_id)}
            return result
        elif op == "complete":

            if not session_id or not parts_json:
                raise HTTPException(422, "Missing required parameters")
            try:
                result = {"op": "complete", **svc.complete(session_id, parts_json)}
                return result
            except ValueError as e:
                raise HTTPException(422, f"Invalid JSON: {str(e)}")
        elif op == "abort":
            if not session_id:
                raise HTTPException(422, "session_id is required")
            result = {"op": "abort", **svc.abort(session_id)}
            return result
        elif op == "upload_part":
            if not session_id or part_number is None:
                raise HTTPException(422, "Missing required parameters")
            # 使用新的upload_part方法处理后端直接上传
            try:
                # 尝试获取current_user参数
                current_user = Depends(auth.get_current_active_user)
                result = {"op": "upload_part", **svc.upload_part(session_id, part_number, current_user)}
            except Exception as user_error:
                result = {"op": "upload_part", **svc.upload_part(session_id, part_number)}
            return result
        else:
            raise HTTPException(400, "invalid op")
    except HTTPException as he:
        raise
    except Exception as e:
        # 捕获更具体的异常类型进行处理
        if isinstance(e, ValueError) and "JSON" in str(e):
            raise HTTPException(422, f"Invalid JSON format: {str(e)}")
        elif "session" in str(e).lower():
            raise HTTPException(422, f"Session error: {str(e)}")
        elif "part" in str(e).lower():
            raise HTTPException(422, f"Part error: {str(e)}")
        else:
            # 返回简单的错误信息，避免暴露详细信息
            raise HTTPException(500, "Internal server error")
