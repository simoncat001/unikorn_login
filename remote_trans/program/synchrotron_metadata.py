#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Populate the synchrotron radiation template from real-world data drops.

The data delivered to :mod:`remote_trans` now consists of raw XAS/XES scan
files, logbook excerpts and assorted metadata sheets.  Only some experiments
ship a ready-to-consume ``metadata.json``/``.yaml`` file, while others rely on
plain-text records such as ``scan_info.txt`` or notebook exports.  This helper
ingests as much information as it can find in a dataset directory, maps the
values onto the ``同步辐射表征元数据规范-2025.json`` template and prints a filled
JSON structure.  When structured metadata files are present they take
precedence; otherwise the script falls back to heuristics that recognise
common key/value phrases (both English and Chinese) and timestamps extracted
from logbooks.

Usage
-----

.. code-block:: bash

    python synchrotron_metadata.py \
        remote_trans/data/synchrotron_radiation/<dataset_dir> \
        --pretty

The command accepts either the dataset directory or any file located inside the
drop (for example ``metadata.json``).  When a file path is supplied the helper
scans its parent directory to collect the remaining artefacts so that the
template's “原始文件” section can be populated automatically.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
import sys
import unicodedata
from copy import deepcopy
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, MutableMapping, Tuple

try:  # pragma: no cover - optional dependency
    import yaml  # type: ignore
except Exception:  # pragma: no cover - PyYAML is optional
    yaml = None  # type: ignore

try:  # pragma: no cover - optional dependency
    from openpyxl import load_workbook  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    load_workbook = None  # type: ignore

HERE = Path(__file__).resolve().parent
DEFAULT_TEMPLATE = HERE.parent / "templates" / "synchrotron_radiation" / "同步辐射表征元数据规范-2025.json"
STRUCTURED_SUFFIXES = {".json", ".yaml", ".yml"}
TEXTUAL_SUFFIXES = {".txt", ".dat", ".cfg", ".ini", ".info", ".log", ".lst", ".csv"}
TABULAR_SUFFIXES = {".xlsx", ".xlsm"}

ALIASES: Dict[str, Tuple[str, str]] = {
    "experiment name": ("experiment", "name"),
    "experiment title": ("experiment", "name"),
    "experiment": ("experiment", "name"),
    "实验名称": ("experiment", "name"),
    "principal investigator": ("experiment", "principal_investigator"),
    "pi": ("experiment", "principal_investigator"),
    "实验负责人": ("experiment", "principal_investigator"),
    "experiment team": ("experiment", "team"),
    "team": ("experiment", "team"),
    "实验团队": ("experiment", "team"),
    "location": ("experiment", "location"),
    "beamline location": ("experiment", "location"),
    "实验地点": ("experiment", "location"),
    "start time": ("experiment", "start_time"),
    "开始时间": ("experiment", "start_time"),
    "end time": ("experiment", "end_time"),
    "结束时间": ("experiment", "end_time"),
    "notes": ("experiment", "notes"),
    "实验备注": ("experiment", "notes"),
    "beamline": ("beamline", "beamline"),
    "束线名称": ("beamline", "beamline"),
    "束线": ("beamline", "beamline"),
    "facility": ("beamline", "facility"),
    "光源设施": ("beamline", "facility"),
    "光源设施名称": ("beamline", "facility"),
    "photon energy": ("beamline", "photon_energy_eV"),
    "光子能量": ("beamline", "photon_energy_eV"),
    "photon energy (ev)": ("beamline", "photon_energy_eV"),
    "beam energy": ("beamline", "photon_energy_eV"),
    "incident energy": ("beamline", "photon_energy_eV"),
    "storage ring current": ("beamline", "storage_ring_current_mA"),
    "储存环电流": ("beamline", "storage_ring_current_mA"),
    "ring current": ("beamline", "storage_ring_current_mA"),
    "monochromator": ("beamline", "monochromator"),
    "单色器": ("beamline", "monochromator"),
    "exit slit": ("beamline", "exit_slit_um"),
    "出射狭缝": ("beamline", "exit_slit_um"),
    "exit slit width": ("beamline", "exit_slit_um"),
    "detector name": ("detector", "name"),
    "detector": ("detector", "name"),
    "探测器名称": ("detector", "name"),
    "detector model": ("detector", "model"),
    "探测器型号": ("detector", "model"),
    "detector type": ("detector", "model"),
    "detector distance": ("detector", "distance_mm"),
    "sample to detector distance": ("detector", "distance_mm"),
    "样品到探测器距离": ("detector", "distance_mm"),
    "sample name": ("sample", "name"),
    "样品名称": ("sample", "name"),
    "sample": ("sample", "name"),
    "sample environment": ("sample", "environment"),
    "样品环境": ("sample", "environment"),
    "environment": ("sample", "environment"),
    "temperature": ("sample", "temperature_K"),
    "样品温度": ("sample", "temperature_K"),
    "temperature (k)": ("sample", "temperature_K"),
    "temperature (c)": ("sample", "temperature_K"),
    "temperature (°c)": ("sample", "temperature_K"),
    "样品温度(℃)": ("sample", "temperature_K"),
    "scan mode": ("scan", "mode"),
    "扫描模式": ("scan", "mode"),
    "mode": ("scan", "mode"),
    "scan points": ("scan", "points"),
    "points": ("scan", "points"),
    "扫描点数": ("scan", "points"),
    "dwell time": ("scan", "dwell_time_s"),
    "integration time": ("scan", "dwell_time_s"),
    "单点积分时间": ("scan", "dwell_time_s"),
    "energy range": ("scan", "energy_range_eV"),
    "扫描能区范围": ("scan", "energy_range_eV"),
    "comments": ("scan", "comments"),
    "备注": ("scan", "comments"),
}

NUMERIC_FIELDS = {
    ("beamline", "photon_energy_eV"),
    ("beamline", "storage_ring_current_mA"),
    ("beamline", "exit_slit_um"),
    ("detector", "distance_mm"),
    ("sample", "temperature_K"),
    ("scan", "points"),
    ("scan", "dwell_time_s"),
}

DATETIME_FIELDS = {
    ("experiment", "start_time"),
    ("experiment", "end_time"),
}

DATA_PRIORITIES = (".dat", ".h5", ".hdf5", ".nxs", ".nx", ".csv", ".txt")


def _parse_datetime(value: str) -> _dt.datetime | None:
    value = value.strip()
    if not value:
        return None
    try:
        return _dt.datetime.fromisoformat(value)
    except ValueError:
        pass
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
    ):
        try:
            return _dt.datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _update(target: Dict[str, object], key: str, value: object) -> None:
    if value not in (None, ""):
        target[key] = value


def _collect_dataset_files(input_path: Path) -> Tuple[Path, List[Path]]:
    if input_path.is_file():
        dataset_dir = input_path.parent
    elif input_path.is_dir():
        dataset_dir = input_path
    else:
        raise FileNotFoundError(f"{input_path} does not exist")
    files = sorted(p for p in dataset_dir.rglob("*") if p.is_file())
    if not files:
        raise FileNotFoundError(f"No files found in dataset directory {dataset_dir}")
    return dataset_dir, files


def _read_structured_metadata(path: Path) -> Dict[str, object]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".json":
        data = json.loads(text)
        if not isinstance(data, dict):
            raise TypeError(f"Top-level structure in {path} must be a JSON object")
        return data
    if path.suffix.lower() in {".yaml", ".yml"}:
        if yaml is None:  # pragma: no cover - optional dependency path
            raise RuntimeError(
                f"Cannot parse {path.name}: install PyYAML to read YAML files"
            )
        data = yaml.safe_load(text)
        if not isinstance(data, dict):
            raise TypeError(f"Unexpected metadata structure in {path}")
        return data
    raise ValueError(f"Unsupported structured metadata format: {path.suffix}")


def _normalise_key(key: str) -> str:
    key = key.strip().strip(":=：")
    key = key.replace("（", "(").replace("）", ")")
    key = unicodedata.normalize("NFKC", key)
    key = re.sub(r"[\s_]+", " ", key)
    return key.strip().lower()


def _iter_text_key_values(path: Path) -> Iterator[Tuple[str, str]]:
    for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        line = line.lstrip("#;*").strip()
        if not line:
            continue
        if ":" in line:
            key, value = line.split(":", 1)
        elif "=" in line:
            key, value = line.split("=", 1)
        elif "," in line:
            left, right = line.split(",", 1)
            if re.search(r"[A-Za-z\u4e00-\u9fff]", left):
                key, value = left, right
            else:
                continue
        elif re.search(r"\s{2,}", line):
            parts = re.split(r"\s{2,}", line, maxsplit=1)
            if len(parts) == 2 and re.search(r"[A-Za-z\u4e00-\u9fff]", parts[0]):
                key, value = parts
            else:
                continue
        else:
            continue
        key = key.strip()
        value = value.strip()
        if not key or not value:
            continue
        yield key, value


def _parse_numeric(value: str) -> float | int | None:
    cleaned = value.replace(",", " ")
    match = re.search(r"[-+]?\d+(?:\.\d+)?", cleaned)
    if not match:
        return None
    number = float(match.group(0))
    if number.is_integer():
        return int(number)
    return number


def _coerce_value(section: str, key: str, value: str, *, original_key: str | None = None) -> object:
    if (section, key) in DATETIME_FIELDS:
        parsed = _parse_datetime(value)
        return parsed.isoformat() if parsed else value
    if (section, key) in NUMERIC_FIELDS or (section, key) == ("sample", "temperature_K"):
        numeric = _parse_numeric(value)
        if numeric is None:
            return value
        upper = value.upper()
        if (section, key) == ("beamline", "photon_energy_eV"):
            if "KEV" in upper:
                return numeric * 1_000
        if (section, key) == ("sample", "temperature_K"):
            if "℃" in value or "摄氏" in value or "°C" in value or upper.endswith(" C"):
                return round(numeric + 273.15, 2)
            if "K" in upper:
                return numeric
            if original_key and "c" in original_key.lower() and "k" not in upper:
                return round(numeric + 273.15, 2)
        if isinstance(numeric, float):
            return int(numeric) if numeric.is_integer() else numeric
        return numeric
    return value


def _merge_into(metadata: MutableMapping[str, Dict[str, object]], section: str, key: str, value: object) -> None:
    bucket = metadata.setdefault(section, {})
    existing = bucket.get(key)
    if isinstance(existing, str) and existing.strip():
        return
    if existing not in (None, ""):
        return
    bucket[key] = value


def _integrate_structured(metadata: MutableMapping[str, Dict[str, object]], data: Dict[str, object]) -> None:
    for section, payload in data.items():
        if not isinstance(payload, dict):
            continue
        bucket = metadata.setdefault(section, {})
        for key, value in payload.items():
            if value in (None, ""):
                continue
            bucket[key] = value


def _integrate_textual(metadata: MutableMapping[str, Dict[str, object]], path: Path) -> None:
    for key, value in _iter_text_key_values(path):
        alias_key = _normalise_key(key)
        if alias_key not in ALIASES:
            continue
        section, field = ALIASES[alias_key]
        coerced = _coerce_value(section, field, value, original_key=key)
        _merge_into(metadata, section, field, coerced)


def _integrate_tabular(metadata: MutableMapping[str, Dict[str, object]], path: Path) -> None:
    if load_workbook is None:  # pragma: no cover - optional dependency path
        raise RuntimeError(
            f"Cannot parse {path.name}: install openpyxl to read Excel metadata sheets"
        )
    try:
        workbook = load_workbook(path, data_only=True, read_only=True)
    except Exception as exc:  # pragma: no cover - delegated to caller
        raise RuntimeError(f"Failed to load Excel metadata {path.name}: {exc}") from exc
    try:
        sheet = workbook.active
        for row in sheet.iter_rows(values_only=True):
            if not row:
                continue
            key_cell = row[0]
            if key_cell is None:
                continue
            key = str(key_cell).strip()
            if not key:
                continue
            values = [str(cell).strip() for cell in row[1:] if cell not in (None, "")]
            if not values:
                continue
            value = " ".join(v for v in values if v)
            if not value:
                continue
            alias_key = _normalise_key(key)
            if alias_key not in ALIASES:
                continue
            section, field = ALIASES[alias_key]
            coerced = _coerce_value(section, field, value, original_key=key)
            _merge_into(metadata, section, field, coerced)
    finally:
        workbook.close()


def _integrate_logbook(metadata: MutableMapping[str, Dict[str, object]], path: Path) -> None:
    times: List[_dt.datetime] = []
    entries: List[str] = []
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(maxsplit=2)
        if len(parts) >= 2:
            candidate = " ".join(parts[:2])
            dt = _parse_datetime(candidate)
            if dt:
                times.append(dt)
                if len(parts) == 3:
                    entries.append(parts[2])
                continue
        entries.append(line)
    if times:
        start = min(times)
        end = max(times)
        _merge_into(metadata, "experiment", "start_time", start.isoformat())
        _merge_into(metadata, "experiment", "end_time", end.isoformat())
    if entries:
        note = "; ".join(dict.fromkeys(entries))
        if note:
            bucket = metadata.setdefault("experiment", {})
            if not bucket.get("notes"):
                bucket["notes"] = note


def _extract_scan_statistics(path: Path) -> Tuple[int | None, Tuple[float, float] | None]:
    energies: List[float] = []
    try:
        if path.stat().st_size > 20_000_000:  # skip very large files
            return None, None
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None, None
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue
        tokens = re.split(r"[\s,\t]+", line)
        if not tokens:
            continue
        try:
            energy = float(tokens[0])
        except ValueError:
            continue
        energies.append(energy)
    if not energies:
        return None, None
    energies.sort()
    points = len(energies)
    return points, (energies[0], energies[-1])


def _format_energy_range(bounds: Tuple[float, float]) -> str:
    start, end = bounds
    return f"{start:g}-{end:g}"


def _gather_metadata(dataset_dir: Path, dataset_files: Iterable[Path]) -> Dict[str, Dict[str, object]]:
    file_list = list(dataset_files)
    metadata: Dict[str, Dict[str, object]] = {
        "experiment": {},
        "beamline": {},
        "detector": {},
        "sample": {},
        "scan": {},
        "files": {},
    }

    for file_path in file_list:
        suffix = file_path.suffix.lower()
        if suffix in STRUCTURED_SUFFIXES:
            try:
                data = _read_structured_metadata(file_path)
            except Exception as exc:
                print(
                    f"[synchrotron_metadata] skipped {file_path.name}: {exc}",
                    file=sys.stderr,
                )
                continue
            _integrate_structured(metadata, data)

    for file_path in file_list:
        suffix = file_path.suffix.lower()
        if suffix in TEXTUAL_SUFFIXES:
            if file_path.name.lower().startswith("logbook"):
                _integrate_logbook(metadata, file_path)
            else:
                _integrate_textual(metadata, file_path)
        elif suffix in TABULAR_SUFFIXES:
            try:
                _integrate_tabular(metadata, file_path)
            except Exception as exc:
                print(
                    f"[synchrotron_metadata] skipped {file_path.name}: {exc}",
                    file=sys.stderr,
                )

    # Provide sensible fallbacks if experiment/sample names were missing.
    default_name = dataset_dir.name
    if not metadata["experiment"].get("name"):
        metadata["experiment"]["name"] = default_name
    if not metadata["sample"].get("name"):
        metadata["sample"]["name"] = default_name

    # Derive the experiment date from the start time if available.
    start_time = metadata["experiment"].get("start_time")
    if isinstance(start_time, str):
        dt = _parse_datetime(start_time)
        if dt:
            metadata["experiment"]["start_time"] = dt.isoformat()

    needs_points = metadata["scan"].get("points") in (None, "", 0)
    needs_range = not metadata["scan"].get("energy_range_eV")
    if needs_points or needs_range:
        for candidate in file_list:
            suffix = candidate.suffix.lower()
            if suffix not in {".dat", ".txt", ".csv"}:
                continue
            if candidate.name.lower().startswith("logbook"):
                continue
            points, bounds = _extract_scan_statistics(candidate)
            if needs_points and points:
                metadata["scan"]["points"] = points
                needs_points = False
            if needs_range and bounds:
                metadata["scan"]["energy_range_eV"] = _format_energy_range(bounds)
                needs_range = False
            if not needs_points and not needs_range:
                break

    primary = metadata.get("files", {}).get("primary")
    if not primary:
        candidate = _choose_primary_file(dataset_dir, file_list)
        if candidate:
            metadata.setdefault("files", {})["primary"] = candidate

    return metadata


def _choose_primary_file(dataset_dir: Path, dataset_files: Iterable[Path]) -> str | None:
    files = list(dataset_files)
    for suffix in DATA_PRIORITIES:
        for path in files:
            if path.suffix.lower() == suffix:
                try:
                    return str(path.relative_to(dataset_dir))
                except ValueError:
                    return path.name
    if files:
        try:
            return str(files[0].relative_to(dataset_dir))
        except ValueError:
            return files[0].name
    return None


def populate_template(
    template: Dict[str, object],
    metadata: Dict[str, object],
    dataset_dir: Path,
    dataset_files: Iterable[Path],
) -> Dict[str, object]:
    filled = deepcopy(template)

    experiment = metadata.get("experiment", {}) if isinstance(metadata.get("experiment"), dict) else {}
    beamline = metadata.get("beamline", {}) if isinstance(metadata.get("beamline"), dict) else {}
    detector = metadata.get("detector", {}) if isinstance(metadata.get("detector"), dict) else {}
    sample = metadata.get("sample", {}) if isinstance(metadata.get("sample"), dict) else {}
    scan = metadata.get("scan", {}) if isinstance(metadata.get("scan"), dict) else {}
    files = metadata.get("files", {}) if isinstance(metadata.get("files"), dict) else {}

    _update(filled, "实验名称", experiment.get("name", ""))
    _update(filled, "实验负责人", experiment.get("principal_investigator", ""))
    _update(filled, "实验团队", experiment.get("team", ""))
    _update(filled, "实验地点", experiment.get("location", ""))

    start_time = _parse_datetime(str(experiment.get("start_time", ""))) if experiment else None
    if start_time is not None:
        _update(filled, "实验日期", start_time.date().isoformat())
    notes = experiment.get("notes", "")
    if notes:
        existing_note = str(filled.get("实验备注", "")).strip()
        filled["实验备注"] = notes if not existing_note else f"{existing_note}; {notes}"

    beam_section = dict(filled.get("光束参数", {}))
    _update(beam_section, "光源设施名称", beamline.get("facility", ""))
    _update(beam_section, "束线名称", beamline.get("beamline", ""))
    if beamline.get("photon_energy_eV") is not None:
        beam_section["光子能量(eV)"] = beamline.get("photon_energy_eV")
    if beamline.get("storage_ring_current_mA") is not None:
        beam_section["储存环电流(mA)"] = beamline.get("storage_ring_current_mA")
    _update(beam_section, "单色器", beamline.get("monochromator", ""))
    slit_width = beamline.get("exit_slit_um")
    if slit_width not in (None, ""):
        beam_section["出射狭缝宽度(μm)"] = slit_width
    filled["光束参数"] = beam_section

    detector_section = dict(filled.get("探测系统", {}))
    _update(detector_section, "探测器名称", detector.get("name", ""))
    _update(detector_section, "探测器型号", detector.get("model", ""))
    if detector.get("distance_mm") is not None:
        detector_section["样品到探测器距离(mm)"] = detector.get("distance_mm")
    filled["探测系统"] = detector_section

    sample_section = dict(filled.get("样品信息", {}))
    _update(sample_section, "样品名称", sample.get("name", ""))
    _update(sample_section, "样品环境", sample.get("environment", ""))
    if sample.get("temperature_K") is not None:
        sample_section["样品温度(K)"] = sample.get("temperature_K")
    filled["样品信息"] = sample_section

    scan_section = dict(filled.get("扫描参数", {}))
    _update(scan_section, "扫描模式", scan.get("mode", ""))
    if scan.get("points") is not None:
        scan_section["扫描点数"] = scan.get("points")
    if scan.get("dwell_time_s") is not None:
        scan_section["单点积分时间(s)"] = scan.get("dwell_time_s")
    _update(scan_section, "扫描能区范围(eV)", scan.get("energy_range_eV", ""))
    filled["扫描参数"] = scan_section

    comments = scan.get("comments", "")
    if comments:
        existing = str(filled.get("备注", "")).strip()
        filled["备注"] = comments if not existing else f"{existing}; {comments}"

    paths = sorted(Path(p) for p in dataset_files)
    original_files = dict(filled.get("原始文件", {}))
    if paths:
        primary = files.get("primary") if isinstance(files, dict) else None
        if not primary:
            primary = _choose_primary_file(dataset_dir, paths)
        if primary:
            original_files["表征原始数据文件"] = primary
        rel_lines: List[str] = []
        for p in paths:
            try:
                rel = p.relative_to(dataset_dir)
            except ValueError:
                rel = p
            rel_lines.append(str(rel))
        original_files["表征原始数据列表"] = "\n".join(rel_lines)
    filled["原始文件"] = original_files

    return filled


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "input",
        type=Path,
        help="Directory that contains the synchrotron data or the path to a metadata file",
    )
    parser.add_argument(
        "--template",
        type=Path,
        default=DEFAULT_TEMPLATE,
        help="Path to the synchrotron radiation metadata template (JSON)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Write the populated template to this file instead of stdout",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON with indentation",
    )
    args = parser.parse_args()

    dataset_dir, dataset_files = _collect_dataset_files(args.input)
    if args.output:
        output_path = args.output.resolve()
        dataset_files = [p for p in dataset_files if p.resolve() != output_path]
    metadata = _gather_metadata(dataset_dir, dataset_files)

    with args.template.open("r", encoding="utf-8") as fh:
        template_data = json.load(fh)

    filled = populate_template(template_data, metadata, dataset_dir, dataset_files)
    json_text = json.dumps(filled, ensure_ascii=False, indent=2 if args.pretty else None)

    if args.output:
        args.output.write_text(json_text + ("\n" if args.pretty else ""), encoding="utf-8")
    else:
        print(json_text)


if __name__ == "__main__":
    main()
