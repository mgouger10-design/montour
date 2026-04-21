const express = require('express');
const cors = require('cors');
const routesFile = require('./routes/file');
const routesOCR = require('./routes/ocr');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
// Limite augmentée à 10 Mo pour accepter les images base64 envoyées par le mobile
app.use(express.json({ limit: '10mb' }));

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MonTour API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F0F4F8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .carte { background: #fff; border-radius: 20px; padding: 48px 40px; max-width: 460px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,.08); text-align: center; }
    h1 { font-size: 40px; font-weight: 900; color: #1565C0; margin: 0 0 4px; letter-spacing: -1px; }
    .badge { display: inline-block; background: #E3F2FD; color: #1565C0; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; letter-spacing: .5px; }
    p { color: #607080; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
    .endpoint { background: #F0F4F8; border-radius: 10px; padding: 14px 18px; text-align: left; font-family: monospace; font-size: 13px; color: #1a2535; line-height: 2; }
    .méthode-get  { color: #2E7D32; font-weight: 700; }
    .méthode-post { color: #F57F17; font-weight: 700; }
    .point-vert { display: inline-block; width: 8px; height: 8px; background: #69F0AE; border-radius: 50%; margin-right: 6px; }
    .statut { font-size: 13px; color: #607080; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="carte">
    <h1>MonTour</h1>
    <div class="badge">API v1.0</div>
    <p>Backend de suivi de file d'attente pour les urgences du Québec.<br/>Utilisé par l'app mobile <strong>MonTour</strong> et le dashboard <strong>FilePro</strong>.</p>
    <div class="endpoint">
      <span class="méthode-get">GET</span>  /api/file/:hopital<br/>
      <span class="méthode-get">GET</span>  /api/file/:hopital/:ticket<br/>
      <span class="méthode-post">POST</span> /api/file/:hopital/suivant<br/>
      <span class="méthode-post">POST</span> /api/file/:hopital/update-current<br/>
      <span class="méthode-post">POST</span> /api/ocr/lire-ticket<br/>
      <span class="méthode-get">GET</span>  /api/sante
    </div>
    <div class="statut"><span class="point-vert"></span>Serveur opérationnel</div>
  </div>
</body>
</html>`);
});

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
