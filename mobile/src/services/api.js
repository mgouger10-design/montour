// URL de base de l'API — 192.168.2.165 représente localhost vu depuis l'émulateur Android
const URL_BASE = 'http://192.168.2.165:3000/api';

// Interroge le backend pour obtenir la position dans la file
export const obtenirPositionFile = async (hopital, numeroTicket) => {
  const réponse = await fetch(`${URL_BASE}/file/${hopital}/${numeroTicket}`);
  if (!réponse.ok) {
    const erreur = await réponse.json();
    throw new Error(erreur.erreur || 'Erreur lors de la récupération de la position');
  }
  return réponse.json();
};

// Envoie une photo (base64 JPEG) au backend pour extraction OCR du numéro de ticket
// Retourne : { ticket: string|null, texteComplet: string }
export const envoyerImageOCR = async (imageBase64) => {
  const réponse = await fetch(`${URL_BASE}/ocr/lire-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!réponse.ok) {
    const erreur = await réponse.json();
    throw new Error(erreur.erreur || "Erreur lors de l'analyse OCR");
  }
  return réponse.json();
};
