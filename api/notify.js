// api/notify.js — Vercel Serverless Function
// Sends email notification via Resend when a form response, lead form, or
// contact message is submitted.

export const config = {
  runtime: 'edge',
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'hello@formporn.app';
const NOTIFY_EMAIL = 'treitalexander@gmail.com';

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // CORS headers — allow formporn.app to call this
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://formporn.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { type, formTitle, formId, responseData, submitterEmail, contactData } = body;

  if (!type) {
    return new Response(JSON.stringify({ error: 'Missing type' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  let emailPayload;

  // ─── TYPE 1: Form submission / lead-capture notification ───────────────────
  if (type === 'form_submission') {
    if (!formId || !formTitle) {
      return new Response(JSON.stringify({ error: 'Missing formId or formTitle' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Build a table of all submitted fields
    const fieldsHtml = responseData
      ? Object.entries(responseData)
          .map(
            ([key, value]) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#8fa3d0;font-size:13px;white-space:nowrap;">${escapeHtml(key)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#e8eaf6;font-size:13px;">${escapeHtml(String(value))}</td>
          </tr>`
          )
          .join('')
      : '<tr><td colspan="2" style="padding:12px;color:#8fa3d0;">No field data</td></tr>';

    emailPayload = {
      from: `Form Porn <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      subject: `📋 New response: ${formTitle}`,
      html: buildEmailWrapper(`
        <h2 style="margin:0 0 4px;font-size:22px;color:#e8eaf6;font-family:'Georgia',serif;">New Form Response</h2>
        <p style="margin:0 0 24px;color:#8fa3d0;font-size:14px;">Someone just submitted <strong style="color:#c9a84c;">${escapeHtml(formTitle)}</strong></p>

        ${submitterEmail ? `<p style="margin:0 0 20px;font-size:13px;color:#8fa3d0;">Submitted by: <strong style="color:#e8eaf6;">${escapeHtml(submitterEmail)}</strong></p>` : ''}

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0a1628;border:1px solid #1a2744;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <thead>
            <tr style="background:#111e38;">
              <th style="padding:10px 12px;text-align:left;color:#c9a84c;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Field</th>
              <th style="padding:10px 12px;text-align:left;color:#c9a84c;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Response</th>
            </tr>
          </thead>
          <tbody>${fieldsHtml}</tbody>
        </table>

        <a href="https://formporn.app/form-dashboard.html" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c96d);color:#0a0e1a;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">View in Dashboard →</a>
      `),
    };
  }

  // ─── TYPE 2: Contact form submission ────────────────────────────────────────
  else if (type === 'contact') {
    if (!contactData?.name || !contactData?.email || !contactData?.message) {
      return new Response(JSON.stringify({ error: 'Missing contact fields' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    emailPayload = {
      from: `Form Porn <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      reply_to: contactData.email,
      subject: `✉️ Contact: ${contactData.subject || 'New message'} — ${contactData.name}`,
      html: buildEmailWrapper(`
        <h2 style="margin:0 0 4px;font-size:22px;color:#e8eaf6;font-family:'Georgia',serif;">New Contact Message</h2>
        <p style="margin:0 0 24px;color:#8fa3d0;font-size:14px;">Someone reached out via formporn.app</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0a1628;border:1px solid #1a2744;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tbody>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#8fa3d0;font-size:13px;width:100px;">Name</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#e8eaf6;font-size:13px;">${escapeHtml(contactData.name)}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#8fa3d0;font-size:13px;">Email</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#e8eaf6;font-size:13px;"><a href="mailto:${escapeHtml(contactData.email)}" style="color:#c9a84c;">${escapeHtml(contactData.email)}</a></td>
            </tr>
            ${contactData.subject ? `<tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#8fa3d0;font-size:13px;">Subject</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a2744;color:#e8eaf6;font-size:13px;">${escapeHtml(contactData.subject)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 12px;color:#8fa3d0;font-size:13px;vertical-align:top;">Message</td>
              <td style="padding:10px 12px;color:#e8eaf6;font-size:13px;line-height:1.6;">${escapeHtml(contactData.message).replace(/\n/g, '<br>')}</td>
            </tr>
          </tbody>
        </table>

        <a href="mailto:${escapeHtml(contactData.email)}?subject=Re: ${escapeHtml(contactData.subject || 'Your message')}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c96d);color:#0a0e1a;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">Reply to ${escapeHtml(contactData.name)} →</a>
      `),
    };
  }

  else {
    return new Response(JSON.stringify({ error: 'Unknown type' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // ─── Send via Resend ─────────────────────────────────────────────────────────
  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return new Response(JSON.stringify({ error: 'Email send failed', detail: resendData }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailWrapper(innerHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060c1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060c1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a1628 0%,#111e38 100%);border:1px solid #1a2744;border-bottom:none;border-radius:12px 12px 0 0;padding:28px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:900;letter-spacing:2px;color:#ffffff;font-style:italic;">FORM</span>
                    <span style="font-size:20px;font-weight:900;letter-spacing:2px;color:#4a9eff;font-style:italic;"> PORN</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#8fa3d0;letter-spacing:1px;text-transform:uppercase;">Notification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#0d1b33;border:1px solid #1a2744;border-top:2px solid #c9a84c;border-bottom:none;padding:32px;">
              ${innerHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#060c1a;border:1px solid #1a2744;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;">
              <p style="margin:0;font-size:11px;color:#3d5080;text-align:center;">
                Form Porn LLC · 9720 Wilshire Blvd Suite 400, Beverly Hills CA 90212<br>
                <a href="https://formporn.app" style="color:#4a9eff;text-decoration:none;">formporn.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
