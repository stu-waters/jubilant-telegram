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
    const {
      email,
      reply_text,
      timestamp,
      campaign_name,
      disposition
    } = req.body;

    if (!email || !reply_text || !timestamp || !disposition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { error } = await supabase.from('email_reply').insert([
      {
        email,
        reply_text,
        timestamp,
        campaign_name,
        disposition,
        source: 'instantly'  // 👈 hardcoded here
      }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: 'Insert failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
