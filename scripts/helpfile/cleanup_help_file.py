#!/usr/bin/env python3

import re
from pathlib import Path
from settings import SEPARATOR, SKSP, TMP_PATH


def clean_content(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    current_block = []

    def block_should_be_removed(block_text: str) -> bool:
        lower = block_text.lower()

        return (
            "classified" in lower
            or "not found" in lower
            or f"no such known {SKSP}" in lower
            or f"no such {SKSP} is known to your race" in lower
            or "dark powers cloud your mind" in lower
        )

    def clean_line(line: str):
        stripped = line.strip()

        # Remove empty lines
        if not stripped:
            return None

        # Remove hp/sp prompt lines
        if re.search(r"\|hp:\d+\(\d+\)\s+sp:\d+\(\d+\)", line):
            return None

        # Remove standalone parenthesis status lines
        if re.match(r"^\(.*\)$", stripped):
            return None

        # Remove Autosave
        if stripped.lower() == "autosave.":
            return None

        return stripped

    for line in lines:
        if line.strip().startswith(SEPARATOR):
            block_text = "\n".join(current_block)

            if current_block and not block_should_be_removed(block_text):
                cleaned.extend(current_block)
                cleaned.append(SEPARATOR)

            current_block = []
        else:
            cleaned_line = clean_line(line)
            if cleaned_line is not None:
                current_block.append(cleaned_line)

    # Handle last block
    if current_block:
        block_text = "\n".join(current_block)
        if not block_should_be_removed(block_text):
            cleaned.extend(current_block)

    return "\n".join(cleaned).strip() + "\n"


if __name__ == "__main__":

    input_file = f"{TMP_PATH}new_help_{SKSP}.chr"
    output_file = f"{TMP_PATH}new_help_{SKSP}.cleaned.chr"

    content = Path(input_file).read_text(encoding="utf-8")
    cleaned = clean_content(content)

    Path(output_file).write_text(cleaned, encoding="utf-8")

    print(f"Cleaned file written to: {output_file}")
