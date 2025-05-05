export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  console.log('Incoming Smartlead payload:', JSON.stringify(body, null, 2));

  // Flexible extraction
  const email = body.email || body.sl_lead_email || body.to_email || null;
  const timestamp = body.timestamp || body.reply_message2?.time || null;
  const reply_text = body.reply_text || body.reply_message2?.text || null;
  const campaign_name = body.campaign_name || body.campaign || null;
  const disposition = body.disposition || null;
  const source = 'smartlead';

  if (!email || !timestamp || !reply_text) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: { email, timestamp, reply_text },
    });
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    const { error } = await supabase.from('email_reply').insert([
      {
        email,
        timestamp,
        reply_text,
        campaign_name,
        disposition,
        source,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Supabase insert error', details: error });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
}

