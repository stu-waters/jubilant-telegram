export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://qbdpekfscbosrxwbkcdr.supabase.co/rest/v1/email_send';
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  // 🧠 Manually parse raw body
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

  // 🛠 Field mapping to clean up keys
  const fieldMap = {
    'Contact owner': 'contact_owner',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'companyName': 'company_name',
    'Industry': 'industry'
  };

  for (const [original, cleaned] of Object.entries(fieldMap)) {
    if (original in parsedBody) {
      parsedBody[cleaned] = parsedBody[original];
      delete parsedBody[original];
    }
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
