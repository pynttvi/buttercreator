#!/usr/bin/env python3

from pathlib import Path
import re

from settings import SEPARATOR, SKSP, helps_file, BASE_PATH


HELP_HEADER = f"Help on {SKSP}:"
TYPE_HEADER = f"{SKSP.capitalize()} type:"
DURATION_HEADER = "Usage duration:" if SKSP == "skill" else "Casting time:"


def normalize(name: str) -> str:
    name = name.lower()
    name = re.sub(r"\s+", " ", name)
    name = name.rstrip(".")
    return name.strip()


def normalize_value(value: str) -> str:
    # Convert tabs to space and collapse whitespace
    value = value.replace("\t", " ")
    value = re.sub(r"\s+", " ", value)
    return value.rstrip(".").strip()


def parse_blocks(content):
    blocks = content.split(SEPARATOR)
    entries = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = block.splitlines()
        cleaned_lines = []
        description_lines = []
        entry_name = None
        in_description = False

        for line in lines:
            stripped = line.strip()

            # Header
            if stripped.startswith(HELP_HEADER):
                value = normalize_value(stripped.split(":", 1)[1])
                entry_name = value
                cleaned_lines.append(f"{HELP_HEADER}   {value}")

            # Duration
            elif stripped.startswith("Usage duration:") or stripped.startswith(
                "Casting time:"
            ):
                value = normalize_value(stripped.split(":", 1)[1])
                cleaned_lines.append(f"{DURATION_HEADER}    {value}")

            # Type
            elif stripped.startswith("Skill type:") or stripped.startswith(
                "Spell type:"
            ):
                value = normalize_value(stripped.split(":", 1)[1])
                cleaned_lines.append(f"{TYPE_HEADER}      {value}")

            # Affecting stats (preserve multiline formatting)
            elif stripped.lower().startswith("affecting stat"):
                cleaned_lines.append(stripped)
                in_description = False

            # Blank line marks start of description
            elif not stripped:
                in_description = True

            else:
                if in_description:
                    description_lines.append(line.rstrip())
                else:
                    cleaned_lines.append(line.rstrip())

        if entry_name:
            # Ensure exactly one blank line before description
            if description_lines:
                cleaned_lines.append("")
                cleaned_lines.extend(description_lines)

            entries.append(
                {"name": entry_name, "raw_block": "\n".join(cleaned_lines).strip()}
            )

    return entries


def parse_help_file(file_path):
    content = Path(file_path).read_text(encoding="utf-8")
    return parse_blocks(content)


def merge_help_files(file1, file2):
    entries1 = parse_help_file(file1)
    entries2 = parse_help_file(file2)

    merged = {}

    for entry in entries1:
        merged[normalize(entry["name"])] = entry

    for entry in entries2:
        merged[normalize(entry["name"])] = entry

    return sorted(merged.values(), key=lambda e: normalize(e["name"]))


def write_merged_file(entries, output_file):
    blocks = []

    for entry in entries:
        blocks.append(entry["raw_block"])
        blocks.append(SEPARATOR)

    content = "\n".join(blocks).strip() + "\n"
    Path(output_file).write_text(content, encoding="utf-8")


if __name__ == "__main__":
    file1 = f"{BASE_PATH}{helps_file}"
    file2 = f"{BASE_PATH}new_help_{SKSP}.cleaned.chr"
    output = f"{BASE_PATH}help_{SKSP}_merged.chr"

    merged_entries = merge_help_files(file1, file2)
    write_merged_file(merged_entries, output)

    print(f"Merged {len(merged_entries)} {SKSP}s.")
    print(f"Written to: {output}")
