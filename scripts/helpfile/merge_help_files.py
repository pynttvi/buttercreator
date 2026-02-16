#!/usr/bin/env python3

from pathlib import Path
import re

from settings import SEPARATOR, SKSP, TMP_PATH, helps_file, BASE_PATH

KNOWN_HEADERS = {
    f"Help on {SKSP}:",
    "Usage duration:",
    "Casting time:",
    "Spell cost:",
    "Fatigue:",
    f"{SKSP.capitalize()} type:",
    "Damage type:",
    "Maximum damage:",
    "Spell words:",
    "Affecting stat(s):",
    "Affecting stats:",
    "Affecting stat:",
    "Maximum healing:",
    "Mental Cost:",
}


def normalize(name: str) -> str:
    return re.sub(r"\s+", " ", name.lower()).rstrip(".").strip()


def normalize_value(value: str) -> str:
    value = value.replace("\t", " ")
    value = re.sub(r"\s+", " ", value)
    value = value.rstrip(".")  # remove trailing dots
    return value.strip()


def parse_blocks(content):
    blocks = content.split(SEPARATOR)
    entries = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = block.splitlines()
        headers = []
        description = []
        entry_name = None

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            matched = False
            for header in KNOWN_HEADERS:
                if stripped.startswith(header):
                    value = normalize_value(stripped[len(header) :])

                    if header.lower().startswith(f"help on {SKSP}"):
                        entry_name = value

                    headers.append((header, value))
                    matched = True
                    break

            if not matched:
                description.append(stripped)

        if entry_name:
            entries.append(
                {
                    "name": entry_name,
                    "headers": headers,
                    "description": description,
                }
            )

    return entries


def format_block(entry):
    headers = entry["headers"]
    description = entry["description"]

    max_label = max(len(label) for label, _ in headers)

    lines = []
    for label, value in headers:
        lines.append(f"{label.ljust(max_label)}   {value}")

    if description:
        lines.append("")
        lines.extend(description)

    return "\n".join(lines)


def parse_help_file(path):
    return parse_blocks(Path(path).read_text(encoding="utf-8"))


def merge_help_files(file1, file2):
    e1 = parse_help_file(file1)
    e2 = parse_help_file(file2)

    merged = {}

    for e in e1:
        merged[normalize(e["name"])] = e

    for e in e2:
        merged[normalize(e["name"])] = e

    return sorted(merged.values(), key=lambda e: normalize(e["name"]))


def write_file(entries, output):
    blocks = []
    for e in entries:
        blocks.append(format_block(e))
        blocks.append(SEPARATOR)

    Path(output).write_text("\n".join(blocks).strip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    file1 = f"{BASE_PATH}{helps_file}"
    file2 = f"{TMP_PATH}new_help_{SKSP}.cleaned.chr"
    output = f"{TMP_PATH}help_{SKSP}_merged.chr"

    merged = merge_help_files(file1, file2)
    write_file(merged, output)

    print(f"Merged {len(merged)} {SKSP}s.")
