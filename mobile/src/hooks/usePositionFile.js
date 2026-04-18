import { useState, useEffect, useRef } from 'react';
import { obtenirPositionFile } from '../services/api';

const INTERVALLE_ACTUALISATION_MS = 30_000; // Interroge le backend toutes les 30 secondes

// Surveille la position du patient en temps réel et retourne l'état courant
export const usePositionFile = (hopital, numeroTicket) => {
  const [données, setDonnées] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const minuterie = useRef(null);

  const actualiser = async () => {
    if (!hopital || !numeroTicket) return;
    setChargement(true);
    setErreur(null);
    try {
      const résultat = await obtenirPositionFile(hopital, numeroTicket);
      setDonnées(résultat);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    actualiser();
    minuterie.current = setInterval(actualiser, INTERVALLE_ACTUALISATION_MS);
    return () => clearInterval(minuterie.current);
  }, [hopital, numeroTicket]);

  return { données, chargement, erreur, actualiser };
};
