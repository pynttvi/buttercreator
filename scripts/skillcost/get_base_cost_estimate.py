#!/usr/bin/env python3

import re
from pathlib import Path

from settings import RACE_PERCENT, TMP_PATH


SKILL_HEADER_RE = re.compile(r"^Estimate train skill:\s*(.+?)\.", re.IGNORECASE)
FIVE_PERCENT_RE = re.compile(r"\|\s*5:\s*(?P<exp>\d+)\s*\|\s*(?P<money>\d+)")


def parse_file(text: str):
    results = []
    current_skill = None
    cost_factor = RACE_PERCENT / 100
    for line in text.splitlines():
        line = line.strip()

        # Detect skill header
        header_match = SKILL_HEADER_RE.match(line)
        if header_match:
            current_skill = header_match.group(1).strip()
            continue

        # Detect 5% row
        if current_skill:
            match = FIVE_PERCENT_RE.search(line)
            if match:
                results.append(
                    {
                        "name": current_skill,
                        "percent": 5,
                        "exp_cost": int(match.group("exp")) * cost_factor,
                        "money_cost": int(match.group("money")) * cost_factor,
                    }
                )
                current_skill = None  # avoid duplicate matches

    return results


if __name__ == "__main__":
    file_path = "estimate.txt"

    content = Path(file_path).read_text(encoding="utf-8")
    parsed = parse_file(content)

    costs = []
    for entry in parsed:
        # print(entry)
        costs.append(f"{entry['name']}:{int(entry['exp_cost'])}")

    Path(TMP_PATH + "new_costs.chr").write_text(
        "\n".join(costs).strip() + "\n", encoding="utf-8"
    )

    print(f"\nTotal skills found: {len(parsed)}")
