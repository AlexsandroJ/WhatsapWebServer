const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');
const Session = require('../models/sessionModels');
require('dotenv').config();

// Função para gerar um token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Verifica se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    // Gera o token JWT
    const token = generateToken(user._id);
    // Calcula a data de expiração (1 hora a partir de agora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora em milissegundos
    // Registra a sessão no banco de dados
    await Session.create({ userId: user._id, token, expiresAt });
    // Retorna o token ao cliente
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout de usuário
exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    const session = await Session.findOne({ token });
    if(!session ){
      return res.status(401).json({ error: 'Session inválida.' });
    }
    // Remove a sessão do banco de dados
    await Session.deleteOne({ token });

    res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};