const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    const ampSourceOrigin = req.query.__amp_source_origin || '';
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', ampSourceOrigin);
    res.setHeader('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyJWMM75SKti0AZOnpUJY6GT1ut4gkS0-3ZYu8AgwZnjZ24S4W3Y_VoqUWwN5xHrT1_1Q/exec';

    const urlParams = new URLSearchParams(req.query).toString();
    const urlWithParams = appsScriptUrl + (urlParams ? '?' + urlParams : '');

    const body = typeof req.body === 'string' ? req.body : new URLSearchParams(req.body).toString();

    // Forward POST request to Apps Script backend
    const response = await fetch(urlWithParams, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });

    const textResponse = await response.text();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (e) {
      jsonResponse = { message: 'Unexpected response from backend' };
    }

    const ampSourceOrigin = req.query.__amp_source_origin || '';

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', ampSourceOrigin);
    res.setHeader('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
