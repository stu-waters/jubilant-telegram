export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://qbdpekfscbosrxwbkcdr.supabase.co/rest/v1/email_send';
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  // 🛡 Catch-all raw body handler
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const rawBody = Buffer.concat(buffers).toString();
  console.log('📥 Raw body received:', rawBody);

  let parsedBody;
  try {
    parsedBody = JSON.parse(rawBody);
    console.log('✅ Parsed JSON:', parsedBody);
  } catch (err) {
    console.error('❌ Failed to parse JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON format', raw: rawBody });
  }
  // Rename fields with invalid SQL names
if ('Contact owner' in parsedBody) {
  parsedBody.contact_owner = parsedBody['Contact owner'];
  delete parsedBody['Contact owner'];
}


  // Optional field cleanup/transform:
  if ('campaign-name' in parsedBody) {
    parsedBody.campaign_name = parsedBody['campaign-name'];
    delete parsedBody['campaign-name'];
  }

  try {
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
      console.error('❌ Supabase rejected:', errorBody);
      return res.status(response.status).json({ error: 'Supabase error', details: errorBody });
    }

    return res.status(200).json({ status: 'Forwarded to Supabase' });
  } catch (err) {
    console.error('💥 Unexpected Proxy Error:', err.message);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
