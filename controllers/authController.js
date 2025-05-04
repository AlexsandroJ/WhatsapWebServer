// controllers/authController.js
const axios = require('axios');
const qs = require('querystring');

// Função para redirecionar o usuário para o Google
exports.redirectToGoogle = (req, res) => {
  const { GOOGLE_CLIENT_ID, REDIRECT_URI } = process.env;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid profile email')}`;

  res.redirect(authUrl);
};

// Função para lidar com o callback do Google
exports.handleGoogleCallback = async (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } = process.env;
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Erro: Código de autorização ausente.');
  }

  try {
    // Trocar o código de autorização por um token de acesso
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Usar o token de acesso para obter informações do usuário
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = userResponse.data;
    
    res.json({ userData });
  } catch (error) {
    console.error('Erro ao processar o login:', error.response ? error.response.data : error.message);
    res.status(500).send('Erro ao processar o login.');
  }
};