// /api/instantly-reply.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const body = req.body;
    console.log('Instantly Payload:', body);

    const email = body.email || body.lead_email;
    const timestamp = body.timestamp;
    const campaign_name = body.campaign_name;
    const reply_text = body.reply_text;
    const is_first_reply = body.is_first;

    const { error } = await supabase
      .from('email_reply')
      .insert([
        {
          email,
          timestamp,
          campaign_name,
          reply_text,
          source: 'instantly',
          is_first_reply
        }
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to insert Instantly reply' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
