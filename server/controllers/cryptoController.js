const { getCryptoPrice } = require('../utils/cryptoUtils');

exports.fetchPrice = async (req, res) => {
  const { symbol } = req.params;

  const price = await getCryptoPrice(symbol);
  if (price) {
    res.json({ price });
  } else {
    res.status(500).json({ error: 'Не удалось получить курс валюты' });
  }
};
