# Google Play Publication Checklist — Kolo Quest Kids

App ID: `com.koloquest.kids`  
Version: `4.0.0` (versionCode: 1)  
Privacy Policy URL: `https://<your-netlify-url>/privacy`

---

## ✅ Already done (code)

- [x] Capacitor Android project (`android/`)
- [x] App ID: `com.koloquest.kids`
- [x] Billing permission in AndroidManifest.xml
- [x] Release signing config in build.gradle
- [x] Privacy Policy page at `/privacy` route
- [x] RevenueCat integration (entitlement: `family_plan`)
- [x] Freemium limits (1 child, 2 tasks, 1 recurring, 2 rewards)

---

## 🔲 Step 1: Create keystore (once, keep it safe!)

Run on your local machine (requires JDK):

```bash
keytool -genkey -v \
  -keystore kolo-quest-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias kolo-quest \
  -storepass YOUR_STORE_PASS \
  -keypass YOUR_KEY_PASS \
  -dname "CN=Kolo Quest Kids, OU=Mobile, O=YourName, L=Kyiv, ST=Kyiv, C=UA"
```

⚠️ Back up `kolo-quest-release.jks` — if lost, you cannot update the app on Play Store!

---

## 🔲 Step 2: Build release AAB

Clone repo locally, then:

```bash
# Install deps
npm install

# Set signing vars
export KEYSTORE_PATH=/path/to/kolo-quest-release.jks
export KEYSTORE_PASSWORD=YOUR_STORE_PASS
export KEY_ALIAS=kolo-quest
export KEY_PASSWORD=YOUR_KEY_PASS

# Build
./scripts/build-android.sh release
# → android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔲 Step 3: Google Play Console setup

1. Go to https://play.google.com/console
2. Create new app → "Kolo Quest Kids"
3. Set up app:
   - **Category**: Education / Family
   - **Content rating**: Complete questionnaire (children's app)
   - **Target audience**: Parents + children (family app)
   - **Privacy Policy**: Add your `/privacy` URL
   - **Data safety**: Fill in (collects email, no financial data collected by app)

---

## 🔲 Step 4: Store listing assets

Prepare these images (can use Canva or Figma):

| Asset | Size | Notes |
|-------|------|-------|
| App icon | 512×512 px PNG | No alpha required by Play |
| Feature graphic | 1024×500 px | Banner shown in Play Store |
| Screenshots (phone) | Min 2, max 8 | 1080×1920 or similar |
| Screenshots (tablet, optional) | 1200×1920 | |

App description (Ukrainian):
> Kolo Quest Kids — ігровий додаток для мотивації дітей виконувати домашні завдання та обов'язки. Батьки створюють завдання і призи, діти заробляють зірки та обмінюють їх на нагороди. Безкоштовно для 1 дитини.

Short description (80 chars max):
> Завдання та нагороди для дітей 4–12 років 🌟

---

## 🔲 Step 5: RevenueCat setup

1. Go to https://dashboard.revenuecat.com
2. Create project "Kolo Quest Kids"
3. Add Android app (package: `com.koloquest.kids`)
4. Get **Google Play API credentials** (service account JSON) → paste in RC dashboard
5. Create **Entitlement**: `family_plan`
6. Create **Products** in Google Play Console first:
   - `kolo_quest_monthly` — subscription, $4.99/month
   - `kolo_quest_annual` — subscription, $39.99/year
7. Add these products to RC → create **Offering** `default`
8. Copy your RC **Web API key** (rcb_...) → add to Netlify env: `VITE_RC_API_KEY`
9. Copy your RC **Android API key** → for future native build

---

## 🔲 Step 6: Upload & publish

1. Play Console → Production → Create release
2. Upload `app-release.aab`
3. Release notes (Ukrainian):
   > Перша версія Kolo Quest Kids — ігрова мотивація для дітей!
4. Submit for review
5. Wait 1–7 days for Google review

---

## 🔲 Step 7: Post-publish

- [ ] Add Privacy Policy URL to Netlify env so it matches the published app
- [ ] Test subscription purchase end-to-end (RevenueCat sandbox)
- [ ] Set up RevenueCat webhooks (optional: Supabase Edge Function)
- [ ] Enable Crashlytics (optional: Firebase)
