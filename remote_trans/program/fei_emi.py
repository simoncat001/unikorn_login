from __future__ import annotations

"""Lightweight FEI ``.emi`` reader used by :mod:`tem_metadata`.

The implementation is intentionally small yet more structured than the
ad-hoc regular-expression parsing that lived in ``tem_metadata.py``.
It exposes a dedicated :class:`EmiFile` helper that understands how to
extract the ``<ExperimentalDescription>`` block and query individual
labels or scalar tags from an ``.emi`` container.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple
import re
import xml.etree.ElementTree as ET


@dataclass(frozen=True)
class EmiLabel:
    """Represents a ``<Data>`` entry in the experimental description."""

    label: str
    value: str
    unit: str = ""


class EmiParseError(RuntimeError):
    """Raised when the ``.emi`` file cannot be interpreted."""


class EmiFile:
    """Minimal reader for FEI ``.emi`` metadata containers."""

    def __init__(self, path: Path):
        self.path = Path(path)
        if not self.path.is_file():
            raise FileNotFoundError(self.path)
        self._data = self.path.read_bytes()
        self._text_cache: Optional[str] = None
        self._label_map: Optional[Dict[str, EmiLabel]] = None

    @property
    def text(self) -> str:
        """Decode the raw bytes once and cache the text representation."""

        if self._text_cache is None:
            self._text_cache = self._data.decode("latin-1", errors="ignore")
        return self._text_cache

    def _extract_block(self, tag: str) -> Optional[str]:
        pattern = re.compile(rf"<{tag}>(.*?)</{tag}>", re.IGNORECASE | re.DOTALL)
        match = pattern.search(self.text)
        if not match:
            return None
        content = match.group(1)
        return f"<{tag}>{content}</{tag}>"

    def _experimental_description_element(self) -> Optional[ET.Element]:
        block = self._extract_block("ExperimentalDescription")
        if not block:
            return None
        try:
            return ET.fromstring(block)
        except ET.ParseError as exc:
            raise EmiParseError(f"Failed to parse ExperimentalDescription in {self.path}") from exc

    def labels(self) -> Iterable[EmiLabel]:
        """Yield label entries from the experimental description."""

        if self._label_map is None:
            label_map: Dict[str, EmiLabel] = {}
            element = self._experimental_description_element()
            if element is not None:
                for data_el in element.findall(".//Data"):
                    label = (data_el.findtext("Label") or "").strip()
                    value = (data_el.findtext("Value") or "").strip()
                    unit = (data_el.findtext("Unit") or "").strip()
                    if label and label not in label_map:
                        label_map[label] = EmiLabel(label=label, value=value, unit=unit)
            self._label_map = label_map
        return self._label_map.values()

    def get_label(self, name: str) -> Tuple[str, str]:
        """Return ``(value, unit)`` for the first label with the given name."""

        for entry in self.labels():
            if entry.label == name:
                return entry.value, entry.unit
        return "", ""

    def find_text(self, tag: str) -> str:
        """Return the text enclosed by ``<tag>`` in the file, if present."""

        block = self._extract_block(tag)
        if not block:
            return ""
        try:
            element = ET.fromstring(block)
        except ET.ParseError:
            return ""
        text = element.text or ""
        return text.strip()

    def raw_text(self) -> str:
        """Expose the decoded text for callers that need direct access."""

        return self.text
