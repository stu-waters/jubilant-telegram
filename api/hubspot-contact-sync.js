import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, hubspot_owner_id } = req.body;

  if (!email || !hubspot_owner_id) {
    return res.status(400).json({ error: 'Missing email or owner ID' });
  }

  try {
    // Step 1: Get owner info from HubSpot
    const hubspotResp = await axios.get(
      `https://api.hubapi.com/crm/v3/owners/${hubspot_owner_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    const owner = hubspotResp.data;
    const contact_owner = owner.firstName
      ? `${owner.firstName} ${owner.lastName || ''}`.trim()
      : owner.email || 'Unknown';

    // Step 2: Upsert into Supabase
    await axios.post(
      `${process.env.SUPABASE_URL}/rest/v1/contact_owner_lookup`,
      {
        email,
        contact_owner,
      },
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'resolution=merge-duplicates',
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to sync contact owner' });
  }
}
