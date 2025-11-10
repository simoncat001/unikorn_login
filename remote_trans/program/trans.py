#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
监控指定目录，解析纳米压痕测试数据并在登录后自动上传。

调整说明：
1) 使用用户名 / 密码调用 ``/api/token`` 获取访问令牌；
2) 分片上传与 ``web_submit`` 请求都会携带 ``Authorization`` 头；
3) 移除旧版 Keycloak/unicorn_user 自定义头逻辑，统一走后端登录；
4) 新增 ``--env`` 参数并默认指向 dev（https://test.mgsdb.sjtu.edu.cn/），便于同步最新环境配置。
"""

import os, re, io, csv, sys, time, json, argparse, math, requests, zipfile, threading
from dataclasses import dataclass
from urllib.parse import urljoin

os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
# 让本地地址不经代理
os.environ['NO_PROXY'] = '127.0.0.1,localhost,::1'

from typing import List, Tuple, Optional, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

from backend_client import BackendUploadClient

# ===================== 基本配置 =====================
ENV_BASE_URLS = {
    # 开发环境：外网可访问的测试站点
    "dev": "https://test.mgsdb.sjtu.edu.cn/",
    # 生产环境：正式域名
    "prod": "https://mgsdb.sjtu.edu.cn/",
    # 本地调试：FastAPI 本地启动时
    "local": "http://127.0.0.1:8000/",
}
DEFAULT_ENV = "dev"
DEFAULT_BASE_URL = ENV_BASE_URLS[DEFAULT_ENV]
OBJECT_PREFIX = "devdata"  # MinIO 对象前缀
PART_SIZE = 16 * 1024 * 1024
CONCURRENCY = 8
DEFAULT_TEMPLATE_ID = "1bada3ae-630f-4924-a8c5-270aaf155d90"
DEFAULT_REVIEW_STATUS = "unreviewed"

# 目录监控稳定性阈值
QUIET_SECS = 20
POLL_INTERVAL = 3


@dataclass
class UploadContext:
    client: BackendUploadClient
    part_upload_url: str
    web_submit_url: str
    template_id: str = DEFAULT_TEMPLATE_ID
    review_status: str = DEFAULT_REVIEW_STATUS

# 文件类型
TEXT_EXTS = {".csv", ".tsv", ".txt", ".dat", ".log", ""}  # "" -> 无扩展名文本
EXCEL_EXTS = {".xlsx", ".xls"}
TARGET_REGISTER = "register.txt"

# 模板路径（切换为《高通量纳米压痕表征元数据规范-2025 (3).json》）
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_JSON_PATH = os.path.join(
    os.path.dirname(SCRIPT_DIR),
    "templates",
    "nanoindenter",
    "高通量纳米压痕表征元数据规范-2025 (3).json",
)

# ===================== 通用工具 =====================
def try_decode(b: bytes) -> str:
    for enc in ["utf-8", "utf-8-sig", "gb18030", "gbk", "big5", "cp1252", "latin-1"]:
        try:
            return b.decode(enc)
        except Exception:
            continue
    return b.decode("latin-1", errors="ignore")

def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(s).lower())

# ===================== register.txt 解析 =====================
def _norm_unit(u: str) -> str:
    if not u:
        return ""
    u = u.strip().lower().replace("µ", "μ").replace("u", "μ")
    u = re.sub(r"\s+", "", u)
    u = re.sub(r"[^a-zμ]", "", u)
    if u in ("μn", "μnewton", "micronewton"):
        return "μn"
    if u in ("mn", "millinewton"):
        return "mn"
    if u in ("nn", "nanonewton"):
        return "nn"
    if u in ("n", "newton"):
        return "n"
    if u in ("kn", "kilonewton"):
        return "kn"
    if u in ("gf", "gramforce", "grammeforce"):
        return "gf"
    return u

def normalize_unit_to_uN(val: float, unit: str) -> Optional[float]:
    u = _norm_unit(unit)
    if u == "μn":
        return val
    if u == "mn":
        return val * 1e3
    if u == "nn":
        return val * 1e-3
    if u == "n":
        return val * 1e6
    if u == "kn":
        return val * 1e9
    if u == "gf":
        return val * 9.80665e3
    return val

def parse_sample_name(text: str) -> str:
    m = re.search(r"Data\s+folder\s*:=\s*(.+)", text, flags=re.I)
    if not m:
        return ""
    parts = re.split(r"[\\/]+", m.group(1).strip().rstrip("\\/"))
    return parts[-1] if parts else ""

def parse_test_mode(text: str) -> str:
    m = re.search(r"^\s*Type\s*:=\s*([^\r\n]+)", text, flags=re.I | re.M)
    return m.group(1).strip() if m else ""

def parse_tip_shape(text: str) -> str:
    m = re.search(r"Tip\s+Type\s*:=\s*([^\r\n]+)", text, flags=re.I)
    return m.group(1).strip() if m else ""

def parse_test_date(text: str) -> str:
    pats = [
        r"(?:Test|Measurement|Acquisition|Record|Creation)\s*(?:Date|Time)\s*:=\s*([^\r\n]+)",
        r"(?:Date|Time)\s*:=\s*([^\r\n]+)",
    ]
    for p in pats:
        m = re.search(p, text, flags=re.I)
        if m:
            cand = m.group(1).strip()
            m2 = re.search(r"\b20\d{2}-\d{2}-\d{2}\b", cand)
            return m2.group(0) if m2 else cand
    dates = re.findall(r"\b20\d{2}-\d{2}-\d{2}\b", text)
    if dates:
        from collections import Counter
        return Counter(dates).most_common(1)[0][0]
    return ""

def parse_max_load_uN(text: str) -> str:
    vals = []
    regex = r"(?:Max(?:imum)?|Peak)\s+(?:Force|Load)\s*(?:\[\s*([^\]\s]+)\s*\]|\(\s*([^\)\s]+)\s*\))?\s*:=\s*([0-9.+\-Ee]+)"
    for m in re.finditer(regex, text, flags=re.I):
        unit = m.group(1) or m.group(2) or ""
        try:
            v = float(m.group(3))
        except:
            continue
        vn = normalize_unit_to_uN(v, unit)
        if vn is not None:
            vals.append(vn)
    return f"{max(vals):.6g}" if vals else ""

def extract_register_info(dir_path: str) -> Optional[Dict[str, str]]:
    for dirpath, _, filenames in os.walk(dir_path):
        for fn in filenames:
            if fn.lower() == TARGET_REGISTER:
                with open(os.path.join(dirpath, fn), "rb") as f:
                    txt = try_decode(f.read())
                return {
                    "样品名称": parse_sample_name(txt),
                    "测试日期": parse_test_date(txt),
                    "探针形状类型": parse_tip_shape(txt),
                    "探针负载最大载荷(μN)": parse_max_load_uN(txt),
                    "测试模式": parse_test_mode(txt),
                }
    return None

# ===================== 坐标提取 =====================
def detect_header_line(text: str, max_scan_lines: int = 300):
    lines = text.splitlines()
    for i in range(min(max_scan_lines, len(lines))):
        line = lines[i]
        if not line or "pos" not in line.lower():
            continue
        tokens_tab = [t.strip() for t in line.split("\t")]
        tokens_com = [t.strip() for t in line.split(",")]
        if "posx" in map(norm, tokens_tab) and "posy" in map(norm, tokens_tab):
            return i, "\t"
        if "posx" in map(norm, tokens_com) and "posy" in map(norm, tokens_com):
            return i, ","
    return None, None

def normalize_header_and_read_df(text: str):
    header_idx, sep_char = detect_header_line(text)
    if header_idx is None:
        return None
    lines = text.splitlines()[header_idx:]
    if sep_char != ",":
        lines = [",".join(row.split(sep_char)) for row in lines]
    try:
        return pd.read_csv(io.StringIO("\n".join(lines)))
    except:
        try:
            return pd.read_csv(io.StringIO("\n".join(lines)), sep=None, engine="python")
        except:
            return None

def find_pos_xy_row(df: pd.DataFrame):
    cols = [norm(c) for c in df.columns]
    try:
        xi, yi = cols.index("posx"), cols.index("posy")
    except ValueError:
        return None
    x = pd.to_numeric(df.iloc[:, xi], errors="coerce")
    y = pd.to_numeric(df.iloc[:, yi], errors="coerce")
    mask = x.notna() & y.notna()
    if not mask.any():
        return None
    i0 = mask.idxmax()
    return float(x.loc[i0]), float(y.loc[i0])

def extract_xy_from_text_file(path: str):
    with open(path, "rb") as f:
        text = try_decode(f.read())
    df = normalize_header_and_read_df(text)
    return find_pos_xy_row(df) if df is not None else None

def extract_xy_from_excel(path: str):
    try:
        xls = pd.ExcelFile(path)
        for sheet in xls.sheet_names:
            df = xls.parse(sheet, header=None, dtype=str)
            for r in range(min(100, df.shape[0])):
                if "posx" in map(norm, df.iloc[r, :]) and "posy" in map(norm, df.iloc[r, :]):
                    df2 = xls.parse(sheet, header=r)
                    xy = find_pos_xy_row(df2)
                    if xy:
                        return xy
    except:
        pass
    return None

def scan_for_xy(root: str) -> List[Tuple[float, float, str]]:
    results = []
    base = os.path.abspath(root)
    for dirpath, _, filenames in os.walk(base):
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            ext = os.path.splitext(fn)[1].lower()
            xy = None
            if ext in TEXT_EXTS:
                xy = extract_xy_from_text_file(full)
            elif ext in EXCEL_EXTS:
                xy = extract_xy_from_excel(full)
            if xy:
                results.append((xy[0], xy[1], os.path.relpath(full, base)))
    return results

# ===================== 递归打包 data/ 下 txt =====================
def zip_txt_in_data(subdir_path: str) -> Optional[str]:
    data_dir = os.path.join(subdir_path, "data")
    if not os.path.isdir(data_dir):
        print(f"[INFO] no data folder in {subdir_path}")
        return None
    txt_files = []
    for dp, _, fns in os.walk(data_dir):
        for fn in fns:
            if fn.lower().endswith(".txt"):
                txt_files.append(os.path.join(dp, fn))
    if not txt_files:
        print(f"[INFO] no txt in {data_dir}")
        return None
    zip_path = os.path.join(subdir_path, "data_txt_files.zip")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in txt_files:
            zf.write(p, os.path.relpath(p, data_dir))
    print(f"[ZIP] {zip_path} ({len(txt_files)} files)")
    return zip_path

# ===================== 分片上传（预签名接口） =====================
def api_post(
    session: requests.Session,
    api: str,
    data: dict,
    *,
    headers: Optional[Dict[str, str]] = None,
    files: Dict | None = None,
    timeout: int = 180,
):
    req_headers = dict(headers or {})
    resp = session.post(api, data=data, files=files, headers=req_headers or None, timeout=timeout)
    resp.raise_for_status()
    return resp.json()


def init_upload(
    session: requests.Session,
    headers: Dict[str, str],
    file_path: str,
    content_type: str,
    prefix: str,
    api: str,
):
    resp = api_post(
        session,
        api,
        {
            "op": "init",
            "filename": os.path.basename(file_path),
            "content_type": content_type,
            "object_prefix": prefix,
        },
        headers=headers,
    )
    return resp["session_id"], resp["key"]


def sign_parts(
    session: requests.Session,
    headers: Dict[str, str],
    session_id: str,
    parts: List[int],
    api: str,
) -> Dict[int, str]:
    parts = sorted(set(parts))
    ranges = []
    s = parts[0]
    e = parts[0]
    for p in parts[1:]:
        if p == e + 1:
            e = p
        else:
            ranges.append((s, e))
            s = e = p
    ranges.append((s, e))
    expr = ",".join([f"{a}-{b}" if a != b else f"{a}" for a, b in ranges])
    j = api_post(
        session,
        api,
        {"op": "sign", "session_id": session_id, "part_numbers": expr},
        headers=headers,
    )
    return {int(it["part_number"]): it["url"] for it in j["parts"]}


def list_uploaded(
    session: requests.Session,
    headers: Dict[str, str],
    session_id: str,
    api: str,
) -> Dict[int, str]:
    j = api_post(
        session,
        api,
        {"op": "list", "session_id": session_id},
        headers=headers,
    )
    return {int(p["PartNumber"]): p["ETag"].strip('"') for p in j.get("parts", [])}


def complete_upload(
    session: requests.Session,
    headers: Dict[str, str],
    session_id: str,
    pn_etags: List[Tuple[int, str]],
    api: str,
):
    parts = [{"PartNumber": pn, "ETag": etag} for pn, etag in sorted(pn_etags, key=lambda x: x[0])]
    return api_post(
        session,
        api,
        {"op": "complete", "session_id": session_id, "parts_json": json.dumps({"parts": parts})},
        headers=headers,
    )

def plan_parts(file_size: int, part_size: int) -> List[Tuple[int, int, int]]:
    n = math.ceil(file_size / part_size)
    return [(i + 1, i * part_size, min(part_size, file_size - i * part_size)) for i in range(n)]

def put_part(url: str, path: str, offset: int, size: int, pn: int, max_retry=5) -> str:
    last = None
    for k in range(max_retry):
        try:
            with open(path, "rb") as f:
                f.seek(offset)
                data = f.read(size)
            r = requests.put(url, data=data, timeout=600)
            if r.status_code // 100 != 2:
                raise RuntimeError(f"HTTP {r.status_code}")
            etag = r.headers.get("ETag") or next((v for k, v in r.headers.items() if k.lower() == "etag"), None)
            if not etag:
                raise RuntimeError("No ETag in response")
            return etag.strip('"')
        except Exception as e:
            last = e
            time.sleep(0.8 * (2 ** k))
    raise RuntimeError(f"part {pn} failed: {last}")

def multipart_upload(
    file_path: str,
    content_type: str,
    *,
    session: requests.Session,
    headers: Dict[str, str],
    api: str,
    object_prefix: str = OBJECT_PREFIX,
    part_size: int = PART_SIZE,
    concurrency: int = CONCURRENCY,
    resume: bool = True,
) -> str:
    size = os.path.getsize(file_path)
    if size == 0:
        raise RuntimeError("empty file")
    if part_size < 5 * 1024 * 1024:
        raise RuntimeError("part-size must be >=5MB")
    session_id, key = init_upload(session, headers, file_path, content_type, object_prefix, api)
    print(f"[init] {os.path.basename(file_path)} session={session_id} key={key}")
    plan = plan_parts(size, part_size)
    done_map = list_uploaded(session, headers, session_id, api) if resume else {}
    to_do = [pn for pn, _, _ in plan if pn not in done_map]
    if to_do:
        urls = sign_parts(session, headers, session_id, to_do, api)
        results: Dict[int, str] = {}
        with ThreadPoolExecutor(max_workers=concurrency) as ex:
            futs = {ex.submit(put_part, urls[pn], file_path, off, sz, pn): pn
                    for pn, off, sz in plan if pn in to_do}
            done = 0
            for fut in as_completed(futs):
                pn = futs[fut]
                etag = fut.result()
                results[pn] = etag
                done += 1
                if done % 10 == 0 or done == len(futs):
                    print(f"[upload] {done}/{len(futs)} parts")
        done_map.update(results)
    else:
        print("[resume] all parts already uploaded")
    pairs = [(pn, done_map[pn]) for pn, _, _ in plan]
    resp = complete_upload(session, headers, session_id, pairs, api)
    url = resp.get("url")
    if not url:
        raise RuntimeError("no url in complete response")
    print(f"[complete] {os.path.basename(file_path)} -> {url}")
    return url

# ===================== 从中文模板构建 payload（覆盖/补全） =====================
def build_payload_from_template(template_path: str, sample: str, date: str, reg: dict, xy_url: str, zip_url: Optional[str]) -> dict:
    """
    适配你的中文模板：
    - 顶层：样品名称（若模板缺失则补上）
    - 顶层：测试日期、测试模式（覆盖）
    - 压痕探针.探针形状类型（覆盖）
    - 压痕探针.探针负载最大载荷（覆盖为 μN 值字符串）
    - 原始文件.表征原始数据对应列表 = xy_url
      原始文件.表征原始数据文件   = zip_url
    """
    if not os.path.isfile(template_path):
        raise FileNotFoundError(f"template.json not found: {template_path}")
    with open(template_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    if not str(payload.get("样品名称", "")).strip():
        payload["样品名称"] = sample

    if date:
        payload["测试日期"] = date
    if reg.get("测试模式"):
        payload["测试模式"] = reg["测试模式"]

    probe = payload.get("压痕探针")
    if not isinstance(probe, dict):
        probe = {}
        payload["压痕探针"] = probe
    if reg.get("探针形状类型"):
        probe["探针形状类型"] = reg["探针形状类型"]
    if reg.get("探针负载最大载荷(μN)") not in (None, ""):
        probe["探针负载最大载荷"] = str(reg["探针负载最大载荷(μN)"])

    rawfiles = payload.get("原始文件")
    if not isinstance(rawfiles, dict):
        rawfiles = {}
        payload["原始文件"] = rawfiles
    if xy_url:
        rawfiles["表征原始数据对应列表"] = xy_url
    if zip_url:
        rawfiles["表征原始数据文件"] = zip_url

    return payload

# ===================== 目录稳定检测 =====================
def snapshot_tree(path: str):
    snap = []
    for dirpath, _, filenames in os.walk(path):
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            try:
                st = os.stat(full)
                snap.append((os.path.relpath(full, path), st.st_size, int(st.st_mtime)))
            except FileNotFoundError:
                continue
    snap.sort()
    return snap

def wait_until_stable(path: str, quiet_secs: int, poll_interval: int, max_wait_secs: int = 3600) -> bool:
    start = time.time()
    prev = snapshot_tree(path)
    stable_for = 0
    while True:
        time.sleep(poll_interval)
        cur = snapshot_tree(path)
        if cur == prev:
            stable_for += poll_interval
        else:
            stable_for = 0
            prev = cur
        if stable_for >= quiet_secs:
            return True
        if time.time() - start > max_wait_secs:
            return False

# ===================== 子目录“稳定后”主流程 =====================
def on_directory_ready(dir_path: str, ctx: UploadContext):
    print(f"[READY] {dir_path}")

    reg = extract_register_info(dir_path)
    if not reg:
        print(f"[WARN] register.txt not found under: {dir_path}")
        return

    xy_rows = scan_for_xy(dir_path)
    if not xy_rows:
        print(f"[WARN] No XY points found in: {dir_path}")
        return

    sample = (reg.get("样品名称") or "sample").strip()
    date = (reg.get("测试日期") or "date").strip()
    safe = lambda s: re.sub(r"[^\w\-]+", "_", s)

    # 1) 生成 XY CSV
    xy_csv_name = f"{safe(sample)}_{safe(date)}_xy_locations.csv"
    xy_csv_path = os.path.join(dir_path, xy_csv_name)
    with open(xy_csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["x", "y", "filename"])
        w.writerows(xy_rows)
    print(f"[OUTPUT] XY -> {xy_csv_path}")

    # 2) 打包 data/ 下 txt（递归）
    zip_path = zip_txt_in_data(dir_path)  # 可为 None

    # 3) 分片上传（预签名接口，携带登录令牌）
    session = ctx.client.session
    xy_url = multipart_upload(
        xy_csv_path,
        "text/csv",
        session=session,
        headers=ctx.client.auth_headers(),
        api=ctx.part_upload_url,
    )
    zip_url = None
    if zip_path:
        zip_url = multipart_upload(
            zip_path,
            "application/zip",
            session=session,
            headers=ctx.client.auth_headers(),
            api=ctx.part_upload_url,
        )

    # 4) 读取模板并合成 payload
    payload = build_payload_from_template(TEMPLATE_JSON_PATH, sample, date, reg, xy_url, zip_url)

    # 5) 登录状态提交到后端 web_submit
    wrapped = {
        "template_id": ctx.template_id,
        "json_data": json.dumps(payload, ensure_ascii=False),
        "review_status": ctx.review_status,
    }
    resp = session.post(
        ctx.web_submit_url,
        json=wrapped,
        headers=ctx.client.auth_headers(),
        timeout=30,
    )

    if resp.status_code >= 400:
        print(f"[WEB_SUBMIT_ERR] {resp.status_code}\n{resp.text}")
    resp.raise_for_status()

    print(f"[WEB_SUBMIT] {resp.status_code} {resp.text}")

# ===================== 监控器（仅监控“一级子目录创建”） =====================
class FirstLevelDirHandler(FileSystemEventHandler):
    def __init__(self, root: str, quiet_secs: int, poll_interval: int, ctx: UploadContext):
        super().__init__()
        self.root = os.path.abspath(root)
        self.quiet_secs = quiet_secs
        self.poll_interval = poll_interval
        self.pending = set()
        self.ctx = ctx

    def is_first_level_subdir(self, path: str) -> bool:
        path = os.path.abspath(path)
        parent = os.path.dirname(path)
        return os.path.isdir(path) and os.path.samefile(parent, self.root)

    def on_created(self, event: FileSystemEvent):
        if not event.is_directory:
            return
        subdir = os.path.abspath(event.src_path)
        if not self.is_first_level_subdir(subdir):
            return
        if subdir in self.pending:
            return
        self.pending.add(subdir)
        print(f"[CREATE] first-level dir: {subdir}")

        def worker():
            ok = wait_until_stable(subdir, self.quiet_secs, self.poll_interval)
            if ok:
                try:
                    on_directory_ready(subdir, self.ctx)
                finally:
                    self.pending.discard(subdir)
            else:
                print(f"[TIMEOUT] {subdir} not stable in time")
                self.pending.discard(subdir)

        threading.Thread(target=worker, daemon=True).start()

# ===================== 入口 =====================
def main():
    ap = argparse.ArgumentParser(
        description="Watch new subdirs; parse, zip, upload; load 高通量纳米压痕表征元数据规范-2025 (3).json; submit JSON with authenticated requests.")
    ap.add_argument("--root", required=True, help="Root folder to watch (first-level subdirs).")
    ap.add_argument("--quiet-secs", type=int, default=QUIET_SECS, help="Seconds of no changes to treat subdir as stable.")
    ap.add_argument("--poll-interval", type=int, default=POLL_INTERVAL, help="Polling interval while checking stability.")
    ap.add_argument(
        "--env",
        choices=sorted(ENV_BASE_URLS.keys()),
        default=DEFAULT_ENV,
        help="快捷设置后端环境，默认 dev (https://test.mgsdb.sjtu.edu.cn/)。指定 --base-url 时忽略。",
    )
    ap.add_argument(
        "--base-url",
        default=None,
        help="Backend base URL. 若未指定则根据 --env 选择预设地址。",
    )
    ap.add_argument("--username", help="Backend login username (or set UPLOAD_USERNAME env variable).")
    ap.add_argument("--password", help="Backend login password (or set UPLOAD_PASSWORD env variable).")
    ap.add_argument("--template-id", default=DEFAULT_TEMPLATE_ID, help="Template ID for web_submit payload.")
    ap.add_argument("--review-status", default=DEFAULT_REVIEW_STATUS, help="Review status to store with the submission.")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"[ERROR] not a dir: {root}", file=sys.stderr)
        sys.exit(1)

    if not os.path.isfile(TEMPLATE_JSON_PATH):
        print(
            f"[ERROR] 模板文件不存在: {TEMPLATE_JSON_PATH}",
            file=sys.stderr,
        )
        sys.exit(2)

    username = args.username or os.environ.get("UPLOAD_USERNAME")
    password = args.password or os.environ.get("UPLOAD_PASSWORD")
    if not username or not password:
        print("[ERROR] --username/--password or UPLOAD_USERNAME/UPLOAD_PASSWORD env vars must be provided", file=sys.stderr)
        sys.exit(3)

    if args.base_url:
        base_url = args.base_url
        resolved_env = None
    else:
        base_url = ENV_BASE_URLS[args.env]
        resolved_env = args.env
    base_url = base_url.rstrip("/") + "/"
    client = BackendUploadClient(base_url)
    try:
        client.login(username, password)
    except Exception as exc:
        print(f"[ERROR] login failed: {exc}", file=sys.stderr)
        sys.exit(4)

    part_upload_url = urljoin(client.base_url, "api/development_data/part_upload")
    web_submit_url = urljoin(client.base_url, "api/development_data/web_submit")
    ctx = UploadContext(
        client=client,
        part_upload_url=part_upload_url,
        web_submit_url=web_submit_url,
        template_id=args.template_id,
        review_status=args.review_status,
    )

    handler = FirstLevelDirHandler(root, args.quiet_secs, args.poll_interval, ctx)
    obs = Observer()
    obs.schedule(handler, root, recursive=False)
    obs.start()
    if resolved_env:
        print(
            f"[WATCHING] {root} (quiet={args.quiet_secs}s, poll={args.poll_interval}s)"
            f" -> {base_url} [env={resolved_env}]"
        )
    else:
        print(
            f"[WATCHING] {root} (quiet={args.quiet_secs}s, poll={args.poll_interval}s)"
            f" -> {base_url}"
        )
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        obs.stop()
    obs.join()

if __name__ == "__main__":
    main()
