"""
ETL script: Parse NC LGC AFIR Excel files and output public/data.json

Usage: python3 process_afir.py
Run from the etl/ directory.
"""

import json
import math
import os
from datetime import datetime, timezone

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "data.json")

FILES = [
    "County and Municipal AFIRs for 2025 (A-F).xlsx",
    "County and Municipal AFIRs for 2025 (G-O).xlsx",
    "County and Municipal AFIRs for 2025 (P-Z).xlsx",
]

SHEET = "FinancialInformationByAllForCur"

# 0-indexed row numbers for key metrics
METRIC_ROWS = {
    "population":          71,
    "gfRevenues":          72,
    "gfExpenditures":      73,
    "gfExcess":            78,
    "fbaDollars":          79,
    "fbaPct":              80,
    "fbaPctGroupAvg":      81,
    "fbaPctStateAvg":      83,
    "revalYear":           97,
    "taxRateNominal":      99,
    "assessedValAdj":     105,
    "taxRateAdj":         106,
    "taxRateAdjGroupAvg": 107,
    "taxRateAdjStateAvg": 108,
    "dominantCounty":     120,
}

HEADER_ROWS = {
    "name":  8,
    "group": 10,
}

# Fields that should be stored as integers (not floats)
INT_FIELDS = {"population", "revalYear", "gfRevenues", "gfExpenditures", "gfExcess", "fbaDollars"}

# Fields that are strings
STR_FIELDS = {"dominantCounty"}


def clean_value(val, field_name):
    """Convert a raw cell value to a clean JSON-serializable value."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    if field_name in STR_FIELDS:
        return str(val).strip() if val else None
    if field_name in INT_FIELDS:
        try:
            return int(round(float(val)))
        except (ValueError, TypeError):
            return None
    # Numeric float
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return None
        return round(f, 6)
    except (ValueError, TypeError):
        return None


def process_file(filepath):
    """Parse one AFIR Excel file and return a list of municipality dicts."""
    print(f"  Reading {os.path.basename(filepath)}...")
    df = pd.read_excel(filepath, sheet_name=SHEET, header=None)

    municipalities = []
    # Municipality data starts at column 8
    for col_idx in range(8, df.shape[1]):
        name = df.iloc[HEADER_ROWS["name"], col_idx]
        if pd.isna(name) or str(name).strip() == "":
            continue

        name = str(name).strip()
        group = df.iloc[HEADER_ROWS["group"], col_idx]
        group = str(group).strip() if not pd.isna(group) else None

        record = {"name": name, "group": group}

        for field, row_idx in METRIC_ROWS.items():
            raw = df.iloc[row_idx, col_idx]
            record[field] = clean_value(raw, field)

        # Derived fields
        pop = record.get("population")
        av = record.get("assessedValAdj")
        fba = record.get("fbaDollars")

        record["avPerCapita"] = (
            round(av / pop) if pop and av and pop > 0 else None
        )
        record["fbaPerCapita"] = (
            round(fba / pop) if pop and fba and pop > 0 else None
        )
        record["hasAuditData"] = record["fbaDollars"] is not None

        municipalities.append(record)

    return municipalities


def main():
    print("NC LGC AFIR ETL — Processing...")
    all_municipalities = []

    for filename in FILES:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  WARNING: {filename} not found, skipping.")
            continue
        all_municipalities.extend(process_file(filepath))

    print(f"  Total municipalities extracted: {len(all_municipalities)}")

    # Build municipalities dict (keyed by name) and groups index
    municipalities = {}
    groups = {}

    for m in sorted(all_municipalities, key=lambda x: x["name"]):
        municipalities[m["name"]] = m
        group = m.get("group")
        if group:
            groups.setdefault(group, []).append(m["name"])

    # Sort each group's members
    for g in groups:
        groups[g].sort()

    # Count audit data availability
    audit_count = sum(1 for m in municipalities.values() if m["hasAuditData"])
    print(f"  Municipalities with audit data: {audit_count}")
    print(f"  Municipalities without audit data: {len(municipalities) - audit_count}")
    print(f"  Peer groups: {len(groups)}")
    for g, members in sorted(groups.items()):
        print(f"    {g}: {len(members)} municipalities")

    output = {
        "metadata": {
            "source": "NC Local Government Commission, Annual Financial Information Report (AFIR)",
            "fiscalYear": "FY 2024-2025",
            "asOf": "June 30, 2025",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "totalMunicipalities": len(municipalities),
        },
        "municipalities": municipalities,
        "groups": groups,
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(output, f, separators=(",", ":"))

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"  Output: {OUTPUT} ({size_kb:.0f} KB)")
    print("Done.")


if __name__ == "__main__":
    main()
