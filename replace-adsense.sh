#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./replace-adsense.sh --pub pub-1234567890123456 --slot 1234567890 [--slot2 2345678901 --slot3 ...]
#
# Replaces:
# - ca-pub-1300049746675872 -> ca-${PUB}
# - data-ad-slot="XXXXXXXXXX" -> provided slots (round-robin if multiple)
# - ads.txt publisher id

PUB=""
SLOTS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pub)
      PUB="${2:-}"
      shift 2
      ;;
    --slot|--slot1|--slot2|--slot3|--slot4)
      SLOTS+=("${2:-}")
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PUB" ]]; then
  echo "Error: --pub is required (example: pub-1234567890123456)" >&2
  exit 1
fi

if [[ ${#SLOTS[@]} -eq 0 ]]; then
  echo "Error: at least one --slot is required (example: --slot 1234567890)" >&2
  exit 1
fi

if [[ ! "$PUB" =~ ^pub-[0-9]{16}$ ]]; then
  echo "Error: invalid pub format. Expected pub- + 16 digits." >&2
  exit 1
fi

for s in "${SLOTS[@]}"; do
  if [[ ! "$s" =~ ^[0-9]{10}$ ]]; then
    echo "Error: invalid slot '$s'. Expected exactly 10 digits." >&2
    exit 1
  fi
done

echo "Replacing AdSense IDs..."
echo "Publisher: $PUB"
echo "Slots: ${SLOTS[*]}"

# Replace publisher placeholder everywhere (HTML/JS/TXT)
rg -l 'ca-pub-1300049746675872|pub-1300049746675872' . \
  | while read -r f; do
      perl -0777 -i -pe "s/ca-pub-1300049746675872/ca-$PUB/g; s/pub-1300049746675872/$PUB/g" "$f"
    done

# Replace slot placeholders in HTML files
slot_idx=0
while IFS= read -r file; do
  tmp="$(mktemp)"
  awk -v slots="$(IFS=,; echo "${SLOTS[*]}")" '
    BEGIN{
      n=split(slots, arr, ",");
      i=1;
    }
    {
      while (match($0, /data-ad-slot="XXXXXXXXXX"/)) {
        repl=sprintf("data-ad-slot=\"%s\"", arr[i]);
        $0=substr($0,1,RSTART-1) repl substr($0,RSTART+RLENGTH);
        i++;
        if (i>n) i=1;
      }
      print;
    }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
done < <(rg --files -g '*.html')

echo "Done. Verifying remaining placeholders..."
if rg -n 'XXXXXXXXXXXXXXXXX|XXXXXXXXXX' .; then
  echo "Warning: Some placeholders still remain (see lines above)."
else
  echo "Success: No placeholder IDs found."
fi

