const { put, list } = require('@vercel/blob');

const PATHNAME = 'newnham/data.json';

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  return auth === `Bearer ${process.env.EDITOR_PASSWORD}`;
}

async function readData() {
  const { blobs } = await list({ prefix: PATHNAME, limit: 1 });
  if (!blobs.length) return seed();
  const res = await fetch(blobs[0].url + '?_=' + Date.now());
  return res.json();
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await readData();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    if (!checkAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const blob = await put(PATHNAME, JSON.stringify(req.body), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ url: blob.url });
    } catch (err) {
      console.error('Blob put failed:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).end();
};

function seed() {
  return {
    hero: { intro: '' },
    journalist: { intro: '', examples: [] },
    forfattare:  { intro: '', examples: [] },
    redaktor:    { intro: '', examples: [] },
  };
}
