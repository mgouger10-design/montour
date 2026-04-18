const express = require('express');
const { obtenirPosition, mettreÀJourActuel } = require('../controllers/fileController');

const routeur = express.Router();

// GET  /api/file/:hopital/:ticket        — position du patient dans la file
// POST /api/file/:hopital/update-current — déclarer le numéro actuellement affiché à l'hôpital
routeur.get('/:hopital/:ticket', obtenirPosition);
routeur.post('/:hopital/update-current', mettreÀJourActuel);

module.exports = routeur;
