module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${process.env.EDITOR_PASSWORD}`) {
    return res.status(401).json({ error: 'Fel lösenord' });
  }
  res.status(200).json({ ok: true });
};
