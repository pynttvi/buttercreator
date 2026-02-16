#!/usr/bin/env python3

from pathlib import Path
import re
from settings import BASE_PATH, SKSP, TMP_PATH


def normalize(name: str) -> str:
    return re.sub(r"\s+", " ", name.lower()).strip()


def parse_file(path: str) -> dict:
    data = {}

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or ":" not in line:
                continue

            name, cost = line.split(":", 1)
            data[normalize(name)] = {
                "original_name": name.strip(),
                "cost": int(cost.strip()),
            }

    return data


def merge_files(old_path: str, new_path: str, output_path: str):
    old_data = parse_file(old_path)
    new_data = parse_file(new_path)

    merged = {}
    changed = []
    missing_in_old = []

    # Check new entries (what old file was missing)
    for key, new_entry in new_data.items():
        if key not in old_data:
            missing_in_old.append(new_entry["original_name"])
            merged[key] = new_entry
        else:
            old_entry = old_data[key]

            if old_entry["cost"] != new_entry["cost"]:
                changed.append(
                    {
                        "name": new_entry["original_name"],
                        "old_cost": old_entry["cost"],
                        "new_cost": new_entry["cost"],
                    }
                )

            merged[key] = new_entry  # always prefer new value

    # Keep old entries that are not in new
    for key, old_entry in old_data.items():
        if key not in merged:
            merged[key] = old_entry

    # Sort alphabetically
    sorted_entries = sorted(
        merged.values(), key=lambda e: normalize(e["original_name"])
    )

    # Write merged file
    with open(output_path, "w", encoding="utf-8") as f:
        for entry in sorted_entries:
            f.write(f"{entry['original_name']}:{entry['cost']}\n")

    # Report
    print("=== Cost Changes ===")
    for c in changed:
        print(f"{c['name']}: {c['old_cost']} -> {c['new_cost']}")
    print(f"\nTotal changed: {len(changed)}")

    print("\n=== Missing In Old File ===")
    for name in sorted(missing_in_old):
        print(name)
    print(f"\nTotal missing in old: {len(missing_in_old)}")

    print(f"\nMerged file written to: {output_path}")


if __name__ == "__main__":
    old_file = f"{BASE_PATH}{SKSP}s.chr"
    new_file = f"{TMP_PATH}new_costs.chr"
    output_file = f"{TMP_PATH}merged_costs.chr"

    merge_files(old_file, new_file, output_file)
