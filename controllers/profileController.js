const Profile = require('../models/profileModels');
const User = require('../models/userModels');
const { profileSchema } = require('../validators/controllers/profile');
const validateRequest = require('../validators/middleware');

// Criar ou atualizar um perfil
exports.createOrUpdateProfile = [
  validateRequest(profileSchema),
  async (req, res) => {
    try {
      const { userId } = req.body;

      // Verifica se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // Verifica se o perfil já existe
      let profile = await Profile.findOne({ userId });
      if (!profile) {
        profile = new Profile({ ...req.body, userId });
      } else {
        profile.set(req.body);
      }

      await profile.save();
      res.status(200).json(profile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

// Obter um perfil por ID do usuário
exports.getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verifica se o perfil existe
    const profile = await Profile.findOne({ userId }).populate('userId', 'name email');
    if (!profile) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Excluir um perfil por ID do usuário
exports.deleteProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verifica se o perfil existe
    const profile = await Profile.findOneAndDelete({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    res.status(200).json({ message: 'Perfil excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};