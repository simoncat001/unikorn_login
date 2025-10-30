import os
import json
import hashlib
from typing import Tuple
import warnings
import asyncio
import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from common import status, error, constants
from settings import settings

# 移除代理影响，确保直连S3端点
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
os.environ['NO_PROXY'] = '127.0.0.1,localhost,::1,minio,s3.amazonaws.com'


# 使用 MinIO/S3 作为对象存储，替代单独的 objectservice 服务
# 从settings对象获取配置，确保生产环境能正确加载配置
MINIO_ENDPOINT = settings.MINIO_ENDPOINT or os.getenv("MINIO_ENDPOINT", "http://127.0.0.1:9000")
MINIO_ACCESS_KEY = settings.MINIO_ACCESS_KEY or os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = settings.MINIO_SECRET_KEY or os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = settings.MINIO_BUCKET or os.getenv("MINIO_BUCKET", "mgsdb")

# 打印使用的access key信息（注意：在生产环境中请移除敏感信息打印）
print(f"Using MINIO_ACCESS_KEY: {MINIO_ACCESS_KEY}")
print(f"Access key length: {len(MINIO_ACCESS_KEY)} characters")

# 检查必要的配置项
if not MINIO_ACCESS_KEY or MINIO_ACCESS_KEY == "":
    warnings.warn("Warning: MINIO_ACCESS_KEY is not set or is empty")
if not MINIO_SECRET_KEY or MINIO_SECRET_KEY == "":
    warnings.warn("Warning: MINIO_SECRET_KEY is not set or is empty")

_s3_client = None  # 惰性初始化，避免启动时阻塞 / 失败


def _get_s3():
    global _s3_client
    # 如果客户端已存在但测试连接失败，重新创建客户端
    if _s3_client is not None:
        try:
            # 简单测试连接是否有效
            _s3_client.list_buckets()
            return _s3_client
        except Exception as e:
            print(f"S3客户端连接测试失败，重新创建客户端: {str(e)}")
            _s3_client = None
    
    # 重新创建客户端，添加重试配置
    try:
        # 创建配置对象，增加重试策略
        config = BotoConfig(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            retries={
                'max_attempts': 5,
                'mode': 'adaptive'
            }
        )
        
        _s3_client = boto3.client(
            "s3",
            endpoint_url=MINIO_ENDPOINT,
            aws_access_key_id=MINIO_ACCESS_KEY,
            aws_secret_access_key=MINIO_SECRET_KEY,
            region_name="us-east-1",
            config=config,
        )
        
        # 保证桶存在
        try:
            _s3_client.head_bucket(Bucket=MINIO_BUCKET)
            print(f"成功访问桶: {MINIO_BUCKET}")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            print(f"访问桶失败: {error_code} - {str(e)}")
            # 如果是桶不存在，尝试创建
            if error_code == '404':
                try:
                    _s3_client.create_bucket(Bucket=MINIO_BUCKET)
                    print(f"成功创建桶: {MINIO_BUCKET}")
                except ClientError as create_error:
                    print(f"创建桶失败: {str(create_error)}")
                    warnings.warn(f"Warning: cannot create bucket for object store: {create_error}")
            else:
                warnings.warn(f"Warning: cannot access bucket for object store: {e}")
    except Exception as e:
        print(f"初始化S3客户端失败: {str(e)}")
        warnings.warn(f"Warning: init s3 client failed: {e}")
    return _s3_client


def _sha256(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def _key_from_sha(sha: str) -> str:
    return f"{sha[:2]}/{sha[2:]}"


async def RandomWriteFile(testBlob: bytes):
    # 直接写入 MinIO，返回 sha256
    sha = _sha256(testBlob)
    key = _key_from_sha(sha)
    s3 = _get_s3()
    if s3 is None:
        raise error.FileWriteFailError(message="fail to init object store client")
    try:
        s3.put_object(Bucket=MINIO_BUCKET, Key=key, Body=testBlob)
    except ClientError as e:
        raise error.FileWriteFailError(message=f"fail to write file: {e}")
    return sha


async def ConcurrencyReadFile(blob_sha256_with_ext: str):
    # 忽略扩展名，仅按 sha256 定位对象
    ext_idx = blob_sha256_with_ext.rfind(".")
    sha = blob_sha256_with_ext if ext_idx < 0 else blob_sha256_with_ext[:ext_idx]
    key = _key_from_sha(sha)
    s3 = _get_s3()
    if s3 is None:
        return constants.NOT_FOUND_CONTENT
    try:
        obj = s3.get_object(Bucket=MINIO_BUCKET, Key=key)
        return obj["Body"].read()
    except ClientError:
        return constants.NOT_FOUND_CONTENT
