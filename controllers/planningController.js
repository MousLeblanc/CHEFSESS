// controllers/planningController.js
import Planning from '../models/Planning.js';

export const getUserPlanning = async (req, res) => {
  try {
    const planning = await Planning.findOne({ user: req.user.id });
    if (!planning) {
      return res.status(404).json({ message: 'Aucun planning trouvé.' });
    }
    res.json(planning);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
