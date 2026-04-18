const Tesseract = require('tesseract.js');

// Format attendu pour un numéro de ticket : une lettre majuscule suivie de 2 à 4 chiffres (ex. A004, B12)
const REGEX_TICKET = /[A-Z]\d{2,4}/g;

// PSM 6 = SINGLE_BLOCK — optimisé pour un bloc de texte imprimé court (billet, écran)
// Tesseract.js v5 n'exporte pas l'enum PSM directement ; on passe la valeur numérique.
const TESSERACT_PARAMS = {
  tessedit_pageseg_mode: '6',
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
};

// Tesseract télécharge les données de langue au premier appel (~10 Mo, mis en cache ensuite).
const lireTicket = async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ erreur: 'Champ "image" manquant (base64 attendu)' });
  }

  let worker;
  try {
    const buffer = Buffer.from(image, 'base64');

    // Utilisation du worker explicite pour pouvoir appliquer les paramètres Tesseract
    worker = await Tesseract.createWorker('eng');
    await worker.setParameters(TESSERACT_PARAMS);

    const { data } = await worker.recognize(buffer);
    const texteComplet = data.text.trim().replace(/\n/g, ' ');

    const correspondances = texteComplet.match(REGEX_TICKET);
    const ticket = correspondances ? correspondances[0] : null;

    res.json({ ticket, texteComplet });
  } catch (e) {
    console.error('Erreur OCR Tesseract :', e.message);
    res.status(500).json({ erreur: "Échec de l'analyse OCR" });
  } finally {
    if (worker) await worker.terminate();
  }
};

module.exports = { lireTicket };
