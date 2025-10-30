from minio import Minio
from minio.error import S3Error
import io

def main():
    endpoint = "datastore-mgsdb.sjtu.edu.cn"
    access_key = "unicorn"
    secret_key = "12345678"
    bucket = "testbucket"

    client = Minio(
        endpoint,
        access_key=access_key,
        secret_key=secret_key,
        secure=True  # 或 False，看你是 HTTP 还是 HTTPS
    )

    # 确保 bucket 存在
    found = client.bucket_exists(bucket)
    if not found:
        client.make_bucket(bucket)

    # 创建“文件夹” dir1/（使用 0 字节对象）
    folder_key = "dir1/"
    # 上传一个 0 字节的内容，作为文件夹占位
    client.put_object(bucket, folder_key, io.BytesIO(b""), 0)

    print("Created folder:", folder_key)

    # 列出该 bucket 下的对象
    for obj in client.list_objects(bucket, prefix="", recursive=True):
        print(obj.object_name)

if __name__ == "__main__":
    try:
        main()
    except S3Error as e:
        print("S3Error:", e)

