#!/usr/bin/env python3

import re
from pathlib import Path

from settings import TRAIN


ROW_PATTERN = re.compile(
    r"""
    ^\|\s*
    (?P<name>.+?)\s*
    \|\s*(?P<level>\d+)
    \|\s*(?P<percent>\d+)
    \|\s*(?P<max>\d+)
    \|\s*(?P<exp>[^|]+)
    \|\s*(?P<money>\d+)
    \|
    """,
    re.VERBOSE,
)


def parse_exp(value: str) -> int:
    """
    Converts values like:
    10.0M -> 10000000
    12k   -> 12000
    300   -> 300
    """
    value = value.strip().lower()

    if value.endswith("m"):
        return int(float(value[:-1]) * 1_000_000)

    if value.endswith("k"):
        return int(float(value[:-1]) * 1_000)

    return int(value)


def parse_skill_table(text: str):
    skills = []

    for line in text.splitlines():
        match = ROW_PATTERN.match(line)
        if not match:
            continue

        data = match.groupdict()

        skill = {
            "name": data["name"].strip(),
            "level": int(data["level"]),
            "percent": int(data["percent"]),
            "max": int(data["max"]),
            "exp_cost": parse_exp(data["exp"]),
            "money_cost": int(data["money"]),
        }

        skills.append(skill)

    return skills


if __name__ == "__main__":
    file_path = "list_skills.txt"

    content = Path(file_path).read_text(encoding="utf-8")
    parsed = parse_skill_table(content)
    estimate_command = ""
    for skill in parsed:
        estimate_command += f"estimate {TRAIN} {skill['name']};"

    print(estimate_command)
    print(f"\nTotal skills parsed: {len(parsed)}")
