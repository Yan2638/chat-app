const axios = require('axios');

const getCryptoPrice = async (symbol) => {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY },
      params: { symbol, convert: 'USD' },
    });

    return response.data.data[symbol.toUpperCase()].quote.USD.price;
  } catch (error) {
    console.error('Ошибка при получении курса криптовалюты:', error);
    return null;
  }
};

module.exports = { getCryptoPrice };
