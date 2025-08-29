CRC="$1"
ENDPOINT="${2:-http://localhost:8000/callback}"

curl -sS -X POST "$ENDPOINT" \
  --data-urlencode "id=12345" \
  --data-urlencode "tr_id=01K3BZ8DK8DQY6CMWYJ37CB4KX" \
  --data-urlencode "tr_date=$(date '+%Y-%m-%d %H:%M:%S')" \
  --data-urlencode "tr_crc=${CRC}" \
  --data-urlencode "tr_amount=999.87" \
  --data-urlencode "tr_paid=999.87" \
  --data-urlencode "tr_desc=Sample transaction description" \
  --data-urlencode "tr_status=true" \
  --data-urlencode "tr_error=none" \
  --data-urlencode "tr_email=payer@example.com" \
  --data-urlencode "md5sum=" \
  --data-urlencode "test_mode=1"

echo
