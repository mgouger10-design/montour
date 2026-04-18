const express = require('express');
const cors = require('cors');
const routesFile = require('./routes/file');
const routesOCR = require('./routes/ocr');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Limite augmentée à 10 Mo pour accepter les images base64 envoyées par le mobile
app.use(express.json({ limit: '10mb' }));

// Routes principales
app.use('/api/file', routesFile);
app.use('/api/ocr', routesOCR);

// Vérification santé du serveur
app.get('/api/sante', (req, res) => {
  res.json({ statut: 'ok', heure: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Serveur MonTour démarré sur le port ${PORT}`);
});
