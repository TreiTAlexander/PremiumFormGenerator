// ─────────────────────────────────────────────
//  FormPorn Access Control — access.js
//  Single source of truth for all entitlement checks.
//  Include this before download.js on every form page.
// ─────────────────────────────────────────────

//
//  localStorage schema:
//
//  fp-plan          : 'single' | 'monthly' | 'annual' | null
//  fp-single-form   : filename of the one unlocked form, e.g. 'paystub-editor.html'
//  fp-premium-date  : ISO date string of purchase
//  fp-plan-expires  : ISO date string (monthly = +30d, annual = +365d, single = never expires)
//

const FP = {

  // ── Read current access state ──────────────
  plan() {
    return localStorage.getItem('fp-plan') || null;
  },

  isPremium() {
    const plan = this.plan();
    if (!plan || plan === 'single') return false;
    // Check expiry for monthly/annual
    const expires = localStorage.getItem('fp-plan-expires');
    if (expires && new Date(expires) < new Date()) {
      this.revoke(); // expired — clean up
      return false;
    }
    return true;
  },

  isSingleUnlock() {
    return this.plan() === 'single';
  },

  singleForm() {
    return localStorage.getItem('fp-single-form') || null;
  },

  // ── Check access for a specific form ───────
  // Pass the current page filename, e.g. 'paystub-editor.html'
  canAccess(formFile) {
    if (this.isPremium()) return true;
    if (this.isSingleUnlock()) {
      return this.singleForm() === formFile;
    }
    return false;
  },

  // ── Grant access (called from success.html) ─
  grantSingle(formFile) {
    localStorage.setItem('fp-plan', 'single');
    localStorage.setItem('fp-single-form', formFile);
    localStorage.setItem('fp-premium-date', new Date().toISOString());
    localStorage.removeItem('fp-plan-expires'); // single never expires
  },

  grantMonthly() {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    localStorage.setItem('fp-plan', 'monthly');
    localStorage.setItem('fp-premium-date', new Date().toISOString());
    localStorage.setItem('fp-plan-expires', expires.toISOString());
    localStorage.removeItem('fp-single-form');
    // Legacy key — keep for dashboard.html compatibility
    localStorage.setItem('fp-premium', 'true');
  },

  grantAnnual() {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    localStorage.setItem('fp-plan', 'annual');
    localStorage.setItem('fp-premium-date', new Date().toISOString());
    localStorage.setItem('fp-plan-expires', expires.toISOString());
    localStorage.removeItem('fp-single-form');
    // Legacy key — keep for dashboard.html compatibility
    localStorage.setItem('fp-premium', 'true');
  },

  revoke() {
    localStorage.removeItem('fp-plan');
    localStorage.removeItem('fp-single-form');
    localStorage.removeItem('fp-premium');
    localStorage.removeItem('fp-premium-date');
    localStorage.removeItem('fp-plan-expires');
  },

  // ── UI gate — call on download buttons ─────
  // formFile: current page filename
  // onAllowed: function to run if access granted
  requireAccess(formFile, onAllowed) {
    if (this.canAccess(formFile)) {
      onAllowed();
      return;
    }

    // Not authorized — show upgrade prompt
    const plan = this.plan();
    if (plan === 'single') {
      // They have a single unlock for a DIFFERENT form
      const unlockedForm = this.singleForm();
      const msg = `You've unlocked ${unlockedForm ? unlockedForm.replace('.html','').replace(/-/g,' ') : 'another form'}.\n\nTo download this form, upgrade to Premium or purchase a single unlock for this form.`;
      if (confirm(msg + '\n\nGo to pricing?')) {
        window.location.href = `checkout.html?plan=monthly`;
      }
    } else {
      // Free user
      if (confirm('This is a premium form.\n\nUnlock just this form for $3, or get all forms for $5/month.\n\nGo to pricing?')) {
        // Pass current form so success.html knows what to unlock
        const encoded = encodeURIComponent(formFile);
        window.location.href = `checkout.html?plan=single&form=${encoded}`;
      }
    }
  }
};
