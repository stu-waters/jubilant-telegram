export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://qbdpekfscbosrxwbkcdr.supabase.co/rest/v1/email_send';
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  // Parse the raw request body
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }

  let parsedBody;
  try {
    const rawBody = Buffer.concat(buffers).toString();
    parsedBody = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  try {
    console.log('Incoming body:', parsedBody); // ✅ Will now actually log something

    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(parsedBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: 'Supabase error', details: errorBody });
    }

    return res.status(200).json({ status: 'Forwarded to Supabase' });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
