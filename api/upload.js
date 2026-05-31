const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${process.env.EDITOR_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const filename = req.query.filename || 'upload';
  const contentType = req.headers['content-type'] || 'application/octet-stream';
  const pathname = `newnham/uploads/${Date.now()}-${filename}`;

  const blob = await put(pathname, req, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return res.status(200).json({ url: blob.url });
};

module.exports.config = { api: { bodyParser: false } };
