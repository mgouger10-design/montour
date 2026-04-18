const Tesseract = require('tesseract.js');

// Format attendu pour un numéro de ticket : une lettre majuscule suivie de 2 à 4 chiffres (ex. A004, B12)
const REGEX_TICKET = /[A-Z]\d{2,4}/g;

// Tesseract télécharge les données de langue au premier appel (~10 Mo).
// Les appels suivants utilisent le cache local et sont rapides.
const lireTicket = async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ erreur: 'Champ "image" manquant (base64 attendu)' });
  }

  try {
    // Décoder le base64 en Buffer pour Tesseract
    const buffer = Buffer.from(image, 'base64');

    const { data } = await Tesseract.recognize(buffer, 'eng', {
      // Optimisé pour du texte court imprimé (billets, écrans d'affichage)
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
    });

    const texteComplet = data.text.trim().replace(/\n/g, ' ');

    // Extraire tous les numéros correspondant au format ticket
    const correspondances = texteComplet.match(REGEX_TICKET);
    const ticket = correspondances ? correspondances[0] : null;

    res.json({ ticket, texteComplet });
  } catch (e) {
    console.error('Erreur OCR Tesseract :', e.message);
    res.status(500).json({ erreur: "Échec de l'analyse OCR" });
  }
};

module.exports = { lireTicket };
