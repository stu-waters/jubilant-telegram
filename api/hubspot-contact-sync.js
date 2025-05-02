export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, contact_owner } = req.body;

  if (!email || !contact_owner) {
    return res.status(400).json({ error: 'Missing email or contact_owner' });
  }

  try {
    const supabaseResp = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/contact_owner_lookup`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          email,
          contact_owner,
        }),
      }
    );

    if (!supabaseResp.ok) {
      throw new Error(`Supabase insert failed with ${supabaseResp.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to sync contact owner' });
  }
}

