# Production Deployment Guide - Credifin Campaign Engine

> **Last Updated:** January 27, 2026  
> **Security Audit Status:** ✅ Top 5 Critical Issues Fixed

---

## ⚡ CRITICAL: What Was Fixed (Jan 27, 2026)

### Security Fixes Implemented:
1. ✅ **OTP Expiration** - OTPs now expire after 10 minutes
2. ✅ **Brute Force Protection** - Rate limiting on verify endpoint (5 attempts/5 min)
3. ✅ **Secure Secret Handling** - No fallback to "default_secret", fails hard in production
4. ✅ **No More OTP Logging** - OTPs never logged in production, masked phone numbers
5. ✅ **Loan Amount Validation** - Form now enforces min/max from product config

### Business Logic Fixes:
1. ✅ **EMI Calculator Math** - Fixed division by zero, uses `useMemo` for performance
2. ✅ **Phone Validation** - Must start with 6-9 (valid Indian mobile)
3. ✅ **Duplicate Lead Prevention** - Same mobile+product blocked for 24 hours
4. ✅ **Name Validation** - Only allows letters, spaces, basic punctuation

---

## 🚀 PRODUCTION READINESS CHECKLIST

### Phase 1: CRITICAL (Before ANY Deployment)
- [ ] **Generate OTP_SECRET**: `openssl rand -hex 64` (NEVER use default)
- [ ] **Revoke old Redis tokens**: If .env was committed, create new Upstash instance
- [ ] **Verify .gitignore**: Ensure `.env` is listed (not just `.env.local`)
- [ ] **Test OTP flow**: Confirm expiration works (wait 11 min, should fail)
- [ ] **Test rate limiting**: Try 6+ OTP verifications, should block at 5

### Phase 2: HIGH PRIORITY (Before Launch)
- [ ] **Add database indexes**: Run migration with mobile index
- [ ] **Configure security headers**: Add to next.config.mjs
- [ ] **Setup error monitoring**: Sentry or similar
- [ ] **Configure CORS**: Add middleware.ts
- [ ] **Enable WhatsApp production**: Complete Meta Business Verification
- [ ] **Test all product routes**: Verify /e-rickshaw-loan/delhi works

### Phase 3: RECOMMENDED (Post-Launch)
- [ ] **Add analytics**: Google Analytics or Vercel Analytics
- [ ] **Implement caching**: Cache products.json in memory
- [ ] **Add static generation**: generateStaticParams for popular routes
- [ ] **Setup monitoring**: Uptime monitoring + error alerting
- [ ] **Configure backup**: Database backup schedule

---

## 📋 PRIORITIZED FIX PLAN (Remaining Work)

### Week 1: Security & Stability
| Priority | Task | Est. Time | Files |
|----------|------|-----------|-------|
| 🔴 P0 | Add database index on mobile | 30 min | prisma/schema.prisma |
| 🔴 P0 | Add security headers | 1 hr | next.config.mjs |
| 🔴 P0 | Create middleware.ts for CORS | 1 hr | middleware.ts (new) |
| 🟡 P1 | Add error boundaries | 2 hr | app/error.tsx (new) |
| 🟡 P1 | Fix SEO metadata | 1 hr | app/layout.tsx |

### Week 2: Performance & UX
| Priority | Task | Est. Time | Files |
|----------|------|-----------|-------|
| 🟡 P1 | Cache products.json in memory | 2 hr | app/[product]/[city]/page.tsx |
| 🟡 P1 | Add generateStaticParams | 1 hr | app/[product]/[city]/page.tsx |
| 🟢 P2 | Add React.memo to components | 2 hr | components/*.tsx |
| 🟢 P2 | Add loading states | 1 hr | app/[product]/[city]/loading.tsx |
| 🟢 P2 | Image optimization config | 1 hr | next.config.mjs |

### Week 3: Business Features
| Priority | Task | Est. Time | Files |
|----------|------|-----------|-------|
| 🟢 P2 | Add CIBIL eligibility question | 3 hr | components/LeadFormSticky.tsx |
| 🟢 P2 | City-specific content | 4 hr | public/data/cities.json (new) |
| 🔵 P3 | Add Hindi language option | 6 hr | lib/i18n.ts (new) |
| 🔵 P3 | Analytics integration | 2 hr | components/Analytics.tsx |
| 🔵 P3 | WhatsApp chatbot integration | 8 hr | app/api/webhook/route.ts |

---

## 🔧 ENVIRONMENT SETUP

### Required Environment Variables

```env
# MANDATORY - Application will CRASH without these in production
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
OTP_SECRET="<generate with: openssl rand -hex 64>"

# REQUIRED FOR OTP DELIVERY
WHATSAPP_PHONE_ID="your-meta-phone-id"
WHATSAPP_TOKEN="your-permanent-system-user-token"

# REQUIRED FOR RATE LIMITING
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# OPTIONAL
NODE_ENV="production"
```

### Generate Secure OTP Secret
```bash
# Linux/Mac
openssl rand -hex 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🗄️ DATABASE SETUP

### 1. Get PostgreSQL (Recommended: Neon.tech)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`

### 2. Add Database Indexes (IMPORTANT)
Create new migration:
```bash
npx prisma migrate dev --name add_indexes
```

Add to schema.prisma:
```prisma
model Lead {
  id          String   @id @default(uuid())
  name        String
  mobile      String
  productSlug String
  city        String
  amount      BigInt
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  // ADD THESE INDEXES
  @@index([mobile])
  @@index([createdAt])
  @@index([productSlug, city])
  @@unique([mobile, productSlug, createdAt(sort: Desc)]) // Prevent duplicates
}
```

### 3. Deploy Migration
```bash
npx prisma migrate deploy
```

---

## 🔒 SECURITY HEADERS

Add to `next.config.mjs`:
```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
```

---

## 📱 WHATSAPP API SETUP

### Development (Testing)
- Use the temporary 24-hour token from Meta Dashboard
- Can only message registered test numbers

### Production (Requires Verification)
1. Complete **Meta Business Verification** (2-7 days)
2. Create a **System User** in Business Settings
3. Generate a **Permanent Token** (won't expire)
4. Add phone number to **verified senders**

---

## 🚀 DEPLOYMENT (Vercel)

### Step-by-Step
1. Push code to GitHub
2. Connect repo to Vercel
3. Add ALL environment variables
4. Deploy

### Verify Deployment
```bash
# Test health
curl https://your-domain.vercel.app/api/health

# Test OTP (rate limited)
curl -X POST https://your-domain.vercel.app/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

---

## 🐛 TROUBLESHOOTING

### "OTP_SECRET environment variable is required"
- You're in production without OTP_SECRET
- Generate one: `openssl rand -hex 64`
- Add to Vercel environment variables
- Redeploy

### "Too many requests" errors in development
- Rate limiting is working correctly
- Wait 10 minutes or clear Redis keys
- Or temporarily disable in dev by commenting out

### EMI Calculator shows ₹0
- Check if interest rate slider is at 0%
- Fixed: Now handles 0% rate correctly

### Duplicate leads not blocked
- Check if mobile+productSlug combo exists in last 24h
- Run: `SELECT * FROM "Lead" WHERE mobile='xxx' ORDER BY "createdAt" DESC;`

---

## 📊 MONITORING RECOMMENDATIONS

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Analytics (Vercel)
```bash
npm install @vercel/analytics
```

Add to layout.tsx:
```tsx
import { Analytics } from '@vercel/analytics/react';
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}<Analytics /></body>
    </html>
  );
}
```

---

## ✅ FINAL CHECKLIST BEFORE GO-LIVE

```
□ All environment variables set in Vercel
□ Database migrated with indexes
□ OTP_SECRET is unique (not default)
□ Redis credentials are fresh (not from committed .env)
□ WhatsApp Business verified (or using test mode)
□ Security headers configured
□ Error monitoring active
□ Tested all critical flows:
  □ Form submission → OTP → Verify → Lead created
  □ OTP expiration after 10 min
  □ Rate limiting blocks after 5 attempts
  □ Duplicate lead prevention
  □ EMI calculator with various amounts
□ SEO metadata updated (not "Create Next App")
□ 404 page works for invalid routes
```

---

**Risk Status:** 🟢 LOW (After implementing all checklist items)

**Estimated Time to Production-Ready:** 1-2 developer days
