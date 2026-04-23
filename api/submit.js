const ALLOWED_ORIGINS = [
  'https://mediclinic.lasertips.co.il',
  'https://lp.lasertips.co.il',
];

const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/1070512/orsvzq8/';
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SCORE_THRESHOLD = 0.5;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { recaptcha_token, ...rest } = req.body;

  const verifyRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptcha_token}`,
    { method: 'POST' }
  );
  const captcha = await verifyRes.json();

  if (!captcha.success || captcha.score < RECAPTCHA_SCORE_THRESHOLD) {
    return res.status(400).json({ error: 'reCAPTCHA verification failed' });
  }

  const zapierRes = await fetch(ZAPIER_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  });

  if (!zapierRes.ok) {
    return res.status(502).json({ error: 'Bad Gateway' });
  }

  return res.status(200).json({ ok: true });
}
