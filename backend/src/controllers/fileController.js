const { filesAttente } = require('../data/fileSimulee');

// Seuils de distance (en nombre de tickets) qui déclenchent les alertes couleur
const SEUIL_ROUGE = 3;
const SEUIL_JAUNE = 8;

// Numéro de ticket actuellement appelé par hôpital — mis à jour par scans ou par le dashboard.
// Clé : code hôpital, valeur : { numero, misAJourÀ }
const numérosActuels = {};

// Renvoie les tickets pas encore servis en tenant compte du numéro actuel connu.
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
    const déjàServi = file.tickets.some(t => t.numero === ticket);
    if (déjàServi) {
      return res.status(410).json({ erreur: `Le ticket '${ticket}' a déjà été appelé.` });
    }
    return res.status(404).json({ erreur: `Ticket '${ticket}' introuvable dans la file de ${file.nom}` });
  }

  const position = indexTicket + 1;
  const totalEnAttente = enAttente.length;
  const ticketsDevant = enAttente.slice(0, indexTicket);
  const minutesEstimées = ticketsDevant.reduce((acc, t) => acc + (file.dureesMoyennes[t.priorite] || 30), 0);

  let alerte;
  if (position <= SEUIL_ROUGE)      alerte = 'rouge';
  else if (position <= SEUIL_JAUNE) alerte = 'jaune';
  else                               alerte = 'vert';

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

// POST /api/file/:hopital/update-current — déclarer le numéro actuellement affiché (depuis scan mobile)
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
  const existe = file.tickets.some(t => t.numero === numero);
  if (!existe) {
    return res.status(422).json({ erreur: `Ticket '${numero}' inconnu dans la file de ${file.nom}` });
  }

  numérosActuels[hopital] = { numero, misAJourÀ: new Date().toISOString() };
  console.log(`[${hopital}] Numéro actuel mis à jour (scan) : ${numero}`);

  res.json({ hopital: file.nom, numéroActuel: numero, misAJourÀ: numérosActuels[hopital].misAJourÀ });
};

// GET /api/file/:hopital — état complet de la file pour le dashboard FilePro
const obtenirFile = (req, res) => {
  const { hopital } = req.params;

  const file = filesAttente[hopital];
  if (!file) {
    return res.status(404).json({ erreur: `Hôpital '${hopital}' introuvable` });
  }

  const enAttente = ticketsRestants(file, hopital);

  // Calcul du temps d'attente total et moyen
  const tempsTotal = enAttente.reduce((acc, t) => acc + (file.dureesMoyennes[t.priorite] || 30), 0);
  const tempsMoyen = enAttente.length > 0 ? Math.round(tempsTotal / enAttente.length) : 0;

  res.json({
    hopital: file.nom,
    codeHopital: hopital,
    numéroActuel: numérosActuels[hopital]?.numero ?? null,
    enAttente: enAttente.map(t => ({
      numero: t.numero,
      priorite: t.priorite,
      duréeEstimée: file.dureesMoyennes[t.priorite] || 30,
    })),
    stats: {
      totalEnAttente: enAttente.length,
      tempsMoyenMinutes: tempsMoyen,
      tempsTotalMinutes: tempsTotal,
    },
    misAJourÀ: new Date().toISOString(),
  });
};

// POST /api/file/:hopital/suivant — appeler le prochain ticket (depuis le dashboard FilePro)
const passerAuSuivant = (req, res) => {
  const { hopital } = req.params;

  const file = filesAttente[hopital];
  if (!file) {
    return res.status(404).json({ erreur: `Hôpital '${hopital}' introuvable` });
  }

  const enAttente = ticketsRestants(file, hopital);

  if (enAttente.length === 0) {
    return res.json({ message: 'La file est vide.', numéroActuel: null });
  }

  // Le premier ticket en attente devient le numéro en cours
  const prochain = enAttente[0];
  numérosActuels[hopital] = { numero: prochain.numero, misAJourÀ: new Date().toISOString() };
  console.log(`[${hopital}] Numéro suivant appelé (dashboard) : ${prochain.numero}`);

  // Retourner l'état mis à jour de la file
  const enAttenteAprès = ticketsRestants(file, hopital);
  const tempsTotal = enAttenteAprès.reduce((acc, t) => acc + (file.dureesMoyennes[t.priorite] || 30), 0);

  res.json({
    numéroActuel: prochain.numero,
    enAttente: enAttenteAprès.map(t => ({
      numero: t.numero,
      priorite: t.priorite,
      duréeEstimée: file.dureesMoyennes[t.priorite] || 30,
    })),
    stats: {
      totalEnAttente: enAttenteAprès.length,
      tempsTotalMinutes: tempsTotal,
      tempsMoyenMinutes: enAttenteAprès.length > 0 ? Math.round(tempsTotal / enAttenteAprès.length) : 0,
    },
    misAJourÀ: numérosActuels[hopital].misAJourÀ,
  });
};

module.exports = { obtenirPosition, mettreÀJourActuel, obtenirFile, passerAuSuivant };
