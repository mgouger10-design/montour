const express = require('express');
const { obtenirPosition, mettreÀJourActuel, obtenirFile, passerAuSuivant } = require('../controllers/fileController');

const routeur = express.Router();

// GET  /api/file/:hopital              — état complet de la file (dashboard FilePro)
// GET  /api/file/:hopital/:ticket      — position d'un patient (app mobile)
// POST /api/file/:hopital/suivant      — appeler le prochain numéro (dashboard FilePro)
// POST /api/file/:hopital/update-current — déclarer le numéro actuel (scan mobile)

// Les routes statiques (/suivant, /update-current) doivent être déclarées
// AVANT la route dynamique /:ticket pour éviter les conflits de correspondance.
routeur.get('/:hopital', obtenirFile);
routeur.post('/:hopital/suivant', passerAuSuivant);
routeur.post('/:hopital/update-current', mettreÀJourActuel);
routeur.get('/:hopital/:ticket', obtenirPosition);

module.exports = routeur;
