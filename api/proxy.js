// File: api/proxy.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://qbdpekfscbosrxwbkcdr.supabase.co/rest/v1/email_send';
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Prefer': 'return=minimal' // Optional: tells Supabase not to return full row
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: 'Supabase error', details: errorBody });
    }

    return res.status(200).json({ status: 'Forwarded to Supabase' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
