const express = require('express');
const { obtenirPosition } = require('../controllers/fileController');

const routeur = express.Router();

// GET /api/file/:hopital/:ticket — position du patient dans la file
routeur.get('/:hopital/:ticket', obtenirPosition);

module.exports = routeur;
