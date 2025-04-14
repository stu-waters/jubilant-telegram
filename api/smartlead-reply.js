// /api/smartlead-reply.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for insert permissions
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const body = req.body;
    console.log('Payload:', body);

    // Extract fields from Smartlead reply payload
    const email = body.sl_lead_email || body.to_email;
    const timestamp = body.reply_message?.time || body.event_timestamp;
    const campaign_name = body.campaign_name || null;
    const reply_text = body.reply_message?.text || null;

    // Insert into Supabase
    const { error } = await supabase
      .from('email_reply')
      .insert([
        {
          email,
          timestamp,
          campaign_name,
          reply_text,
          source: 'smartlead',
        }
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to insert reply' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
