// Données simulées pour le développement — à remplacer par l'intégration hospitalière réelle
// Chaque hôpital a une file de tickets avec priorité de triage

const filesAttente = {
  'HMR': {
    nom: 'Hôpital Maisonneuve-Rosemont',
    tickets: [
      { numero: 'A001', priorite: 1, appelé: true },
      { numero: 'A002', priorite: 2, appelé: false },
      { numero: 'A003', priorite: 2, appelé: false },
      { numero: 'A004', priorite: 3, appelé: false },
      { numero: 'A005', priorite: 3, appelé: false },
      { numero: 'A006', priorite: 4, appelé: false },
      { numero: 'A007', priorite: 4, appelé: false },
      { numero: 'A008', priorite: 5, appelé: false },
    ],
    // Durée moyenne en minutes par ticket selon la priorité de triage
    dureesMoyennes: { 1: 0, 2: 15, 3: 30, 4: 45, 5: 60 },
  },
};

module.exports = { filesAttente };
