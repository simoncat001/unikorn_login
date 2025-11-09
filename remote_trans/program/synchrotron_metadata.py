#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fill the synchrotron radiation template from structured metadata files.

The demo data set in ``remote_trans/data/synchrotron_radiation`` ships a
``metadata.json`` file that summarises the most relevant experiment
parameters.  This command line helper loads that file (or a directory that
contains it), combines the information with the synchrotron template stored
under ``remote_trans/templates/synchrotron_radiation`` and outputs a filled
JSON artefact.  The script mirrors the ergonomics of :mod:`tem_metadata` so it
integrates nicely with the rest of the tooling in ``remote_trans/program``.

Usage
-----

.. code-block:: bash

    python synchrotron_metadata.py \
        remote_trans/data/synchrotron_radiation/Fe2O3_XAS \
        --pretty

The command accepts either the path to ``metadata.json`` itself or the
containing directory.  When pointed at a directory it will also list every file
next to the metadata so that the template's “原始文件” block can be
populated.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
from copy import deepcopy
from pathlib import Path
from typing import Dict, Iterable, Tuple

try:  # pragma: no cover - optional dependency
    import yaml  # type: ignore
except Exception:  # pragma: no cover - PyYAML is optional
    yaml = None  # type: ignore

HERE = Path(__file__).resolve().parent
DEFAULT_TEMPLATE = HERE.parent / "templates" / "synchrotron_radiation" / "同步辐射表征元数据规范-2025.json"
DEFAULT_METADATA_NAMES = ("metadata.json", "metadata.yaml", "metadata.yml")


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


def _load_metadata_dict(metadata_path: Path) -> Dict[str, object]:
    text = metadata_path.read_text(encoding="utf-8")
    if metadata_path.suffix.lower() == ".json":
        return json.loads(text)
    if metadata_path.suffix.lower() in {".yaml", ".yml"}:
        if yaml is None:  # pragma: no cover - optional dependency path
            raise RuntimeError(
                f"Cannot parse {metadata_path.name}: install PyYAML to read YAML files"
            )
        data = yaml.safe_load(text)
        if not isinstance(data, dict):
            raise TypeError(f"Unexpected metadata structure in {metadata_path}")
        return data
    raise ValueError(f"Unsupported metadata format: {metadata_path.suffix}")


def detect_metadata_file(input_path: Path) -> Tuple[Path, Iterable[Path]]:
    if input_path.is_file():
        return input_path, list(sorted(p for p in input_path.parent.iterdir() if p.is_file()))
    if input_path.is_dir():
        for name in DEFAULT_METADATA_NAMES:
            candidate = input_path / name
            if candidate.is_file():
                files = list(sorted(p for p in input_path.iterdir() if p.is_file()))
                return candidate, files
        raise FileNotFoundError(
            f"No metadata file found in {input_path}. Expected one of: {', '.join(DEFAULT_METADATA_NAMES)}"
        )
    raise FileNotFoundError(f"{input_path} does not exist")


def populate_template(template: Dict[str, object], metadata: Dict[str, object], dataset_files: Iterable[Path]) -> Dict[str, object]:
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
        primary = files.get("primary") or next((p.name for p in paths if p.name == "metadata.json"), paths[0].name)
        original_files["表征原始数据文件"] = primary
        original_files["表征原始数据列表"] = "\n".join(p.name for p in paths)
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

    metadata_file, dataset_files = detect_metadata_file(args.input)
    metadata = _load_metadata_dict(metadata_file)

    with args.template.open("r", encoding="utf-8") as fh:
        template_data = json.load(fh)

    filled = populate_template(template_data, metadata, dataset_files)
    json_text = json.dumps(filled, ensure_ascii=False, indent=2 if args.pretty else None)

    if args.output:
        args.output.write_text(json_text + ("\n" if args.pretty else ""), encoding="utf-8")
    else:
        print(json_text)


if __name__ == "__main__":
    main()
