const express = require('express');
const { lireTicket } = require('../controllers/ocrController');

const routeur = express.Router();

// POST /api/ocr/lire-ticket — reçoit une image base64, retourne le numéro de ticket extrait
routeur.post('/lire-ticket', lireTicket);

module.exports = routeur;
