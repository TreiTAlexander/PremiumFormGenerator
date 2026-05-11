# Form Porn — GitHub Upload Instructions
## Trial Weekend Launch Deployment Guide

---

## 🗑 STEP 1: Files to DELETE from your GitHub repo

These are old/duplicate versions that should be removed before uploading the new files:

1. `certificate-editor.html` (replaced by `certificate-editor-v2.html`)
2. `license-editor.html` (replaced by `license-gen-v3.html`)
3. `license-gen-v2.html` (replaced by `license-gen-v3.html`)
4. `placard-editor.html` (replaced by `placard-v4.html`)
5. `placard-editor-v2.html` (replaced by `placard-v4.html`)
6. `placard-v3.html` (replaced by `placard-v4.html`)
7. `formporn-landing.html` (replaced by `index.html`)
8. `formporn-retro.html` (old version)
9. `formporn-v3.html` (old version)
10. `formporn-v4.html` (old version)
11. `formporn-v5.html` (old version)
12. `formporn-v6.html` (old version)
13. `feedback.html` (no longer needed)
14. `icon.svg` (replaced by PNG icon files)

**How to delete:** In GitHub web UI: navigate to file → click pencil icon → trash icon → commit. Or use `git rm filename` from command line.

---

## ⬆ STEP 2: Files to UPLOAD (new + updated)

### Critical — The new master index page
- **`index.html`** ⭐ **(replaces existing — this is the main landing page with all 137 templates organized into 13 categories)**

### NEW Forms Added This Session (75 forms)

**Personal & ID (8):**
- `passport-application.html`
- `birth-certificate-request.html`
- `voter-registration-form.html`
- `marriage-license-application.html`
- `emergency-contact-form.html`
- `social-security-application.html`
- `name-change-petition.html`
- `divorce-filing-petition.html`

**Healthcare (6):**
- `hipaa-consent-form.html`
- `surgery-consent-form.html`
- `medical-history-form.html`
- `vaccination-record-form.html`
- `dental-consent-form.html`
- `prescription-refill-form.html`
- `healthcare-power-of-attorney.html`

**Education (5):**
- `school-enrollment-form.html`
- `scholarship-application-form.html`
- `fafsa-application.html`
- `transcript-request-form.html`
- `recommendation-letter.html`

**Employment (5):**
- `i9-eligibility-form.html`
- `employee-onboarding-form.html`
- `employee-writeup-form.html`
- `performance-review-form.html`
- `job-offer-letter.html`

**Banking & Financial (8):**
- `loan-application-form.html`
- `mortgage-application.html`
- `mortgage-preapproval-letter.html`
- `wire-transfer-request.html`
- `check-deposit-slip.html`
- `tax-return-1040.html`
- `sales-receipt.html`

**Government & Legal (12):**
- `small-claims-form.html`
- `police-report-form.html`
- `business-license-application.html`
- `waiver-release-form.html`
- `restraining-order-request.html`
- `jury-duty-exemption.html`
- `child-custody-petition.html`
- `immigration-petition-i130.html`
- `consulting-agreement.html`
- `noncompete-agreement.html`
- `partnership-agreement.html`

**Business & Office (10):**
- `client-intake-form.html`
- `quote-estimate-form.html`
- `meeting-signin-sheet.html`
- `vendor-registration-form.html`
- `vendor-invoice.html`
- `it-support-ticket.html`
- `hardware-checkout-form.html`
- `rma-return-authorization.html`
- `warranty-claim-form.html`
- `donation-receipt.html`
- `customer-satisfaction-survey.html`
- `business-proposal.html`

**Insurance (3):**
- `workers-comp-claim.html`
- `life-insurance-application.html`
- `homeowners-insurance-claim.html`

**Travel & Customs (6):**
- `car-rental-agreement.html`
- `hotel-registration-form.html`
- `customs-declaration-form.html`
- `travel-reimbursement-form.html`
- `tsa-precheck-application.html`
- `visa-application.html`
- `mileage-reimbursement-form.html`
- `driver-log-sheet.html`

**Housing & Real Estate (3):**
- `movein-inspection-form.html`
- `security-deposit-receipt.html`
- `sublease-agreement.html`
- `property-disclosure-form.html`

**Events & Hospitality (5):**
- `event-registration-form.html`
- `photography-release-form.html`
- `dj-booking-contract.html`
- `pet-adoption-application.html`
- `gym-membership-signup.html`
- `volunteer-signup-form.html`
- `membership-application.html`

---

## 🚀 STEP 3: Easy Upload Methods

### Option A — GitHub Web UI (easiest, no command line)
1. Go to your repo: https://github.com/TreiTAlexander/FormPorn
2. Click "Add file" → "Upload files"
3. Drag-drop ALL files from the deployment ZIP into the uploader
4. Scroll down, write commit message: "Add 75 new forms + rebuilt index for trial launch"
5. Click "Commit changes"
6. Vercel will auto-deploy in ~1-2 minutes

### Option B — Command Line (faster for many files)
```bash
cd /path/to/your/local/FormPorn-repo
# Delete old files first
git rm certificate-editor.html license-editor.html license-gen-v2.html \
       placard-editor.html placard-editor-v2.html placard-v3.html \
       formporn-landing.html formporn-retro.html formporn-v3.html \
       formporn-v4.html formporn-v5.html formporn-v6.html feedback.html

# Copy new files from the deployment ZIP, then:
git add .
git commit -m "Add 75 new forms + rebuilt index for trial launch"
git push origin main
```

### Option C — GitHub Desktop App
1. Open GitHub Desktop, ensure you're on the FormPorn repo
2. Drag the unzipped deployment folder contents into the local repo folder
3. Confirm overwrites when prompted
4. In GitHub Desktop, you'll see all changes in the left sidebar
5. Add commit message, click "Commit to main"
6. Click "Push origin"

---

## ✅ STEP 4: Verify Deployment

After Vercel auto-deploys (~1-2 minutes):

1. Visit https://formporn.app
2. Confirm the new index page shows all 13 categories with 137+ forms
3. Click a few new forms to test (try Visa Application, Mortgage Pre-Approval, Hardware Checkout)
4. Test a promo code at checkout (`WEEKEND` is the trial code for friends)
5. Test on mobile if possible

---

## 🎉 STEP 5: Send Trial Friends Their Promo Codes

Pre-loaded promo codes for testing:
- **TRIALRUN** — 7 days premium access
- **WEEKEND** — 7 days, themed for trial weekend
- **FRIEND** — 30 days for trusted testers
- **VIP2026** — 30 days, VIP feel
- **PREVIEW** — 7 days, preview access
- **LAUNCH** — 30 days, launch celebration
- **FORMPORN** — 30 days, brand code

Suggested message:
> "Hey, finally launching Form Porn this weekend! Want to be one of the first to try it? Free for 7 days, use code **WEEKEND** at checkout. Site is formporn.app. Let me know what you think!"

---

## 📊 Final Stats

- **137 unique form templates** organized into 13 categories
- **30+ professional documents** including legal contracts, medical forms, government applications
- **Mobile-responsive**, **PWA-enabled**, **Stripe-integrated**
- Live at: **formporn.app**

You're ready to launch! 🚀
