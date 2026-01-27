#!/bin/bash
# Digital Workplace AI - Maintenance Audit Script
# Run this after every deployment to verify all apps are healthy

set -e

echo "🔍 Digital Workplace AI - Maintenance Audit"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check ESLint for each app
echo "📋 ESLint Check"
echo "---------------"

for app in main chat-core-iq intranet-iq support-iq; do
  cd "/Users/aldrin-mac-mini/digitalworkplace.ai/apps/$app"
  RESULT=$(npx eslint src 2>&1 | grep -E "✖" || echo "✖ 0 problems (0 errors, 0 warnings)")
  ERRORS_COUNT=$(echo "$RESULT" | grep -oP '\d+ error' | grep -oP '\d+' || echo "0")
  WARNINGS_COUNT=$(echo "$RESULT" | grep -oP '\d+ warning' | grep -oP '\d+' || echo "0")
  
  if [ "$ERRORS_COUNT" = "0" ] || [ -z "$ERRORS_COUNT" ]; then
    echo -e "  ✅ $app: ${GREEN}0 errors${NC}, $WARNINGS_COUNT warnings"
  else
    echo -e "  ❌ $app: ${RED}$ERRORS_COUNT errors${NC}, $WARNINGS_COUNT warnings"
    ERRORS=$((ERRORS + ERRORS_COUNT))
  fi
done

echo ""

# Check Production URLs
echo "🌐 Production Health Check"
echo "--------------------------"

declare -A URLS=(
  ["Main"]="https://www.digitalworkplace.ai/sign-in"
  ["dCQ"]="https://dcq.digitalworkplace.ai/dcq/Home/index.html"
  ["dIQ"]="https://intranet-iq.vercel.app/diq/dashboard"
  ["dSQ"]="https://dsq.digitalworkplace.ai/dsq/demo/atc-executive"
)

for app in "${!URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URLS[$app]}" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo -e "  ✅ $app: ${GREEN}HTTP $STATUS${NC}"
  else
    echo -e "  ❌ $app: ${RED}HTTP $STATUS${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Security Headers Check
echo "🔒 Security Headers Check"
echo "-------------------------"

for app in Main dCQ dIQ dSQ; do
  case $app in
    Main) URL="https://www.digitalworkplace.ai" ;;
    dCQ) URL="https://dcq.digitalworkplace.ai" ;;
    dIQ) URL="https://intranet-iq.vercel.app" ;;
    dSQ) URL="https://dsq.digitalworkplace.ai" ;;
  esac
  
  HEADERS=$(curl -sI "$URL" 2>/dev/null || echo "")
  if echo "$HEADERS" | grep -qi "x-frame-options"; then
    echo -e "  ✅ $app: ${GREEN}Security headers present${NC}"
  else
    echo -e "  ⚠️  $app: ${YELLOW}Security headers missing${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""

# Summary
echo "📊 Summary"
echo "----------"
if [ $ERRORS -eq 0 ]; then
  echo -e "  ${GREEN}✅ All checks passed!${NC}"
  echo "  Score: 100/100"
else
  echo -e "  ${RED}❌ $ERRORS errors found${NC}"
  echo "  Score: $((100 - ERRORS * 5))/100"
fi

if [ $WARNINGS -gt 0 ]; then
  echo -e "  ${YELLOW}⚠️  $WARNINGS warnings${NC}"
fi

echo ""
echo "Audit complete at $(date)"
