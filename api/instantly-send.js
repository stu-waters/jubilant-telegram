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

  // 🧹 Whitelist and clean only the fields we want
const cleanedBody = {
  timestamp: parsedBody.timestamp,
  event_type: parsedBody.event_type,
  campaign_id: parsedBody.campaign_id,
  campaign_name: parsedBody.campaign_name,
  email_account: parsedBody.email_account,
  email: parsedBody.email,
  lead_email: parsedBody.lead_email,
  step: parsedBody.step,
  variant: parsedBody.variant,
  email_subject: parsedBody.email_subject,
  email_html: parsedBody.email_html,
  first_name: parsedBody.first_name || parsedBody['firstName'],
  last_name: parsedBody.last_name || parsedBody['lastName'],
  company_name: parsedBody.company_name || parsedBody['companyName'],
  contact_owner: parsedBody.contact_owner || parsedBody['Contact owner'],
  industry: parsedBody.industry || parsedBody['Industry'],
  is_first: parsedBody.is_first,         // <- pull directly from Instantly
  source: 'instantly'                    // <- explicitly tag the source
};


  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(cleanedBody)
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
