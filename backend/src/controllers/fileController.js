const { filesAttente } = require('../data/fileSimulee');

// Seuils de distance (en nombre de tickets) qui déclenchent les alertes couleur
const SEUIL_ROUGE = 3;   // Retourner immédiatement
const SEUIL_JAUNE = 8;   // Prévoir de partir bientôt

// Retourne la position et l'estimation d'attente pour un ticket donné
const obtenirPosition = (req, res) => {
  const { hopital, ticket } = req.params;

  const file = filesAttente[hopital];
  if (!file) {
    return res.status(404).json({ erreur: `Hôpital '${hopital}' introuvable` });
  }

  const ticketsEnAttente = file.tickets.filter(t => !t.appelé);
  const indexTicket = ticketsEnAttente.findIndex(t => t.numero === ticket);

  if (indexTicket === -1) {
    return res.status(404).json({ erreur: `Ticket '${ticket}' introuvable dans la file de ${file.nom}` });
  }

  const position = indexTicket + 1; // 1-indexé pour l'affichage
  const totalEnAttente = ticketsEnAttente.length;

  // Estimation du temps d'attente basée sur les tickets devant soi
  const ticketsDevant = ticketsEnAttente.slice(0, indexTicket);
  const minutesEstimées = ticketsDevant.reduce((acc, t) => {
    return acc + (file.dureesMoyennes[t.priorite] || 30);
  }, 0);

  // Calcul de l'alerte couleur
  let alerte;
  if (position <= SEUIL_ROUGE) {
    alerte = 'rouge';   // Retourner maintenant
  } else if (position <= SEUIL_JAUNE) {
    alerte = 'jaune';   // Partir bientôt
  } else {
    alerte = 'vert';    // Encore du temps
  }

  res.json({
    hopital: file.nom,
    ticket,
    position,
    totalEnAttente,
    minutesEstimées,
    alerte,
    misAJourÀ: new Date().toISOString(),
  });
};

module.exports = { obtenirPosition };
