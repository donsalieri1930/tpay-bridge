#!/usr/bin/env bash

UUID="$1"
PAYER="${2:-0}"
ENDPOINT="${3:-http://localhost:8000/create}"


curl -sS -G "$ENDPOINT" \
  --data-urlencode "uuid=${UUID}" \
  --data-urlencode "payer=${PAYER}" \
  -H 'Accept: application/json'

echo
