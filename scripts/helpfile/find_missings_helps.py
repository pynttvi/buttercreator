#!/usr/bin/env python3

from pathlib import Path
import re
from settings import SEPARATOR, costs_file, helps_file, BASE_PATH, SKSP, UNKNOWN


HELP_HEADER = f"Help on {SKSP}:"
TYPE_LABEL = f"{SKSP.capitalize()} type:"


def parse_costs(file_path):
    entries = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            name, cost = line.split(":", 1)
            entries.append({"name": name.strip(), "cost": cost.strip()})

    return entries


def parse_affecting_stats(text):
    text = re.sub(r"\s+", " ", text.strip())
    text = text.replace(" and ", ", ")
    return [s.strip() for s in text.split(",") if s.strip()]


def parse_help_blocks(content):
    blocks = content.split(SEPARATOR)
    entries = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = block.splitlines()
        entry = {}
        description_lines = []

        i = 0
        while i < len(lines):
            line = lines[i]

            if line.startswith(HELP_HEADER):
                entry["name"] = line.split(":", 1)[1].strip()

            elif line.startswith("Usage duration:") or line.startswith("Casting time:"):
                entry["duration"] = line.split(":", 1)[1].strip()

            elif line.startswith("Fatigue:") or line.startswith("Spell cost:"):
                entry["cost_info"] = line.split(":", 1)[1].strip()

            elif line.startswith(TYPE_LABEL):
                entry["type"] = line.split(":", 1)[1].strip()

            elif line.startswith("Affecting stat"):
                stats_text = line.split(":", 1)[1].strip()
                i += 1

                while i < len(lines) and lines[i].startswith(" "):
                    stats_text += " " + lines[i].strip()
                    i += 1

                entry["affecting_stats"] = parse_affecting_stats(stats_text)
                continue

            else:
                description_lines.append(line)

            i += 1

        if "name" in entry:
            entry["description"] = "\n".join(description_lines).strip()
            entries.append(entry)

    return entries


def parse_help_file(file_path):
    content = Path(file_path).read_text(encoding="utf-8")
    return parse_help_blocks(content)


def normalize(name: str) -> str:
    name = name.lower()
    name = re.sub(r"\s+", " ", name)
    name = name.rstrip(".")
    return name.strip()


if __name__ == "__main__":

    parsed_costs = parse_costs(f"{BASE_PATH}{costs_file}")
    parsed_helps = parse_help_file(f"{BASE_PATH}{helps_file}")

    cost_names = {normalize(s["name"]) for s in parsed_costs}
    unknow_names = {normalize(s) for s in UNKNOWN[SKSP + "s"]}
    help_names = {normalize(h["name"]) for h in parsed_helps}

    missing_help = sorted(cost_names - help_names - unknow_names)
    orphan_helps = sorted(help_names - cost_names)

    print(f"=== {SKSP.capitalize()}s missing help entries ===")
    for name in missing_help:
        print(f'"{name}",')
    print(f"\nTotal missing: {len(missing_help)}")

    print(f"\n=== Help entries without {SKSP} cost ===")
    for name in orphan_helps:
        print(name)
    print(f"\nTotal orphan helps: {len(orphan_helps)}")
