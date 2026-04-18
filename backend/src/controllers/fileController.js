const { filesAttente } = require('../data/fileSimulee');

// Seuils de distance (en nombre de tickets) qui déclenchent les alertes couleur
const SEUIL_ROUGE = 3;
const SEUIL_JAUNE = 8;

// Numéro de ticket actuellement appelé par hôpital — mis à jour par les scans des utilisateurs.
// Clé : code hôpital, valeur : { numero, misAJourÀ }
const numérosActuels = {};

// Renvoie la liste des tickets pas encore servis, en tenant compte du numéro actuel scanné.
// Si un numéro actuel est connu, tous les tickets jusqu'à lui (inclus) sont considérés servis.
const ticketsRestants = (file, hopital) => {
  const actuel = numérosActuels[hopital];
  if (!actuel) {
    return file.tickets.filter(t => !t.appelé);
  }
  const indexActuel = file.tickets.findIndex(t => t.numero === actuel.numero);
  if (indexActuel === -1) {
    return file.tickets.filter(t => !t.appelé);
  }
  // Tous les tickets APRÈS le numéro actuel sont encore en attente
  return file.tickets.slice(indexActuel + 1);
};

// GET /api/file/:hopital/:ticket — position du patient dans la file
const obtenirPosition = (req, res) => {
  const { hopital, ticket } = req.params;

  const file = filesAttente[hopital];
  if (!file) {
    return res.status(404).json({ erreur: `Hôpital '${hopital}' introuvable` });
  }

  const enAttente = ticketsRestants(file, hopital);
  const indexTicket = enAttente.findIndex(t => t.numero === ticket);

  if (indexTicket === -1) {
    // Le ticket a peut-être déjà été servi
    const déjàServi = file.tickets.some(t => t.numero === ticket);
    if (déjàServi) {
      return res.status(410).json({ erreur: `Le ticket '${ticket}' a déjà été appelé.` });
    }
    return res.status(404).json({ erreur: `Ticket '${ticket}' introuvable dans la file de ${file.nom}` });
  }

  const position = indexTicket + 1;
  const totalEnAttente = enAttente.length;

  const ticketsDevant = enAttente.slice(0, indexTicket);
  const minutesEstimées = ticketsDevant.reduce((acc, t) => {
    return acc + (file.dureesMoyennes[t.priorite] || 30);
  }, 0);

  let alerte;
  if (position <= SEUIL_ROUGE) {
    alerte = 'rouge';
  } else if (position <= SEUIL_JAUNE) {
    alerte = 'jaune';
  } else {
    alerte = 'vert';
  }

  res.json({
    hopital: file.nom,
    ticket,
    position,
    totalEnAttente,
    minutesEstimées,
    alerte,
    numéroActuel: numérosActuels[hopital]?.numero ?? null,
    misAJourÀ: new Date().toISOString(),
  });
};

// POST /api/file/:hopital/update-current — enregistre le numéro actuellement affiché à l'écran
// Appelé par les utilisateurs qui scannent l'écran de l'hôpital.
const mettreÀJourActuel = (req, res) => {
  const { hopital } = req.params;
  const { numéroActuel } = req.body;

  if (!numéroActuel || typeof numéroActuel !== 'string') {
    return res.status(400).json({ erreur: 'Champ "numéroActuel" manquant ou invalide' });
  }

  const file = filesAttente[hopital];
  if (!file) {
    return res.status(404).json({ erreur: `Hôpital '${hopital}' introuvable` });
  }

  const numero = numéroActuel.trim().toUpperCase();

  // Vérifier que le numéro existe dans la file connue
  const existe = file.tickets.some(t => t.numero === numero);
  if (!existe) {
    return res.status(422).json({ erreur: `Ticket '${numero}' inconnu dans la file de ${file.nom}` });
  }

  numérosActuels[hopital] = { numero, misAJourÀ: new Date().toISOString() };

  console.log(`[${hopital}] Numéro actuel mis à jour : ${numero}`);

  res.json({
    hopital: file.nom,
    numéroActuel: numero,
    misAJourÀ: numérosActuels[hopital].misAJourÀ,
  });
};

module.exports = { obtenirPosition, mettreÀJourActuel };
