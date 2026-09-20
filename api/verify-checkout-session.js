// api/verify-checkout-session.js — Vercel Serverless Function (Edge runtime)
//
// Closes the success.html free-access bypass: previously, success.html granted
// entitlements purely from its own `?plan=` URL parameter, with no check that a
// real payment ever happened. This endpoint verifies a Stripe Checkout Session
// server-side (payment_status + actual amount charged) before the client is
// allowed to call FP.grantSingle/grantMonthly/grantAnnual.
//
// The plan is derived from the amount actually charged, never from client
// input, so a paid $3 single-unlock session can't be relabeled "annual" by
// editing the URL.
//
// KNOWN LIMITATION (documented, not fixed here): this checks that a REAL,
// PAID Stripe session exists and matches a known price. It does not yet
// record that a session has been "used," so a genuine session_id could in
// theory be replayed by whoever holds it (e.g. forwarded to someone else).
// Closing that fully requires a persisted entitlements table (Phase 1) that
// records granted sessions. Given session_id values are long, random,
// account-scoped, and normally only ever seen by the paying customer in
// their own browser/receipt, this is a much smaller residual risk than the
// previous "no verification at all" bypass, which is the one this endpoint
// closes today.

export const config = {
  runtime: 'edge',
};

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Known plan prices in cents. Must stay in sync with the 3 Stripe Payment
// Links (Single Form Unlock $3, Form Porn Premium Monthly $5, Annual $30).
// TODO(Phase 1): replace with a shared pricing-tiers config once prices can
// change without editing this file, and once tiers move off static Payment
// Links onto dynamically-created Checkout Sessions.
const PLAN_AMOUNTS = {
  300: 'single',
  500: 'monthly',
  3000: 'annual',
};

function withCors(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': 'https://formporn.app',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return withCors(null, 204);
  }
  if (req.method !== 'POST') {
    return withCors({ ok: false, error: 'Method not allowed' }, 405);
  }
  if (!STRIPE_SECRET_KEY) {
    return withCors({ ok: false, error: 'Server not configured' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return withCors({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const sessionId = body && body.session_id;
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return withCors({ ok: false, error: 'Missing or invalid session_id' }, 400);
  }

  let session;
  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
    );
    session = await stripeRes.json();
    if (!stripeRes.ok) {
      return withCors({ ok: false, error: 'Session not found' }, 404);
    }
  } catch (err) {
    return withCors({ ok: false, error: 'Stripe lookup failed' }, 502);
  }

  const paid =
    session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
  if (!paid) {
    return withCors({ ok: false, error: 'Payment not completed' }, 402);
  }

  const amount = session.amount_total;
  const plan = PLAN_AMOUNTS[amount];
  if (!plan) {
    return withCors({ ok: false, error: 'Could not match payment to a known plan' }, 422);
  }

  return withCors({ ok: true, plan: plan, sessionId: sessionId }, 200);
}
