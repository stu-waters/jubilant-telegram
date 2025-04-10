export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://qbdpekfscbosrxwbkcdr.supabase.co/rest/v1/email_send';
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const rawBody = Buffer.concat(buffers).toString();

  let parsedBody;
  try {
    parsedBody = JSON.parse(rawBody);
    console.log('📥 Smartlead Payload:', parsedBody);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  // Split full name into first and last
  const [firstName, ...rest] = (parsedBody.to_name || '').split(' ');
  const lastName = rest.join(' ');

  const cleanedBody = {
    timestamp: parsedBody.event_timestamp,
    event_type: parsedBody.event_type,
    campaign_id: parsedBody.campaign_id,
    campaign_name: parsedBody.campaign_name,
    email_account: parsedBody.from_email,
    email: parsedBody.to_email,
    lead_email: parsedBody.to_email,
    step: parsedBody.sequence_number,
    email_subject: parsedBody.subject,
    email_html: parsedBody.sent_message?.html || null,
    first_name: firstName,
    last_name: lastName,
    contact_owner: null, // Smartlead doesn't send it
    industry: null,      // Not included
    is_first: parsedBody.sequence_number === 1, // assume step 1 means first
    source: 'smartlead'
  };

  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_API_KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(cleanedBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase insert failed:', errorText);
      return res.status(response.status).json({ error: 'Supabase error', details: errorText });
    }

    return res.status(200).json({ status: 'Smartlead data saved to Supabase' });
  } catch (err) {
    console.error('💥 Unexpected Error:', err.message);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
