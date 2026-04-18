import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePositionFile } from '../hooks/usePositionFile';
import BarreProgression from '../components/BarreProgression';
import BandeauAlerte from '../components/BandeauAlerte';

// Hôpital codé en dur pour la démo — à remplacer par un sélecteur
const HOPITAL_DÉMO = 'HMR';

const AccueilScreen = ({ navigation, route }) => {
  const [saisieTicket, setSaisieTicket] = useState('');
  const [ticketConfirmé, setTicketConfirmé] = useState(null);

  // Pré-remplir le ticket si l'on revient de l'écran de scan
  useEffect(() => {
    const ticketScané = route.params?.ticketPrédéfini;
    if (ticketScané) {
      setSaisieTicket(ticketScané);
      setTicketConfirmé(ticketScané);
    }
  }, [route.params?.ticketPrédéfini]);

  const { données, chargement, erreur, actualiser } = usePositionFile(
    HOPITAL_DÉMO,
    ticketConfirmé,
  );

  const confirmerTicket = () => {
    const ticket = saisieTicket.trim().toUpperCase();
    if (ticket) setTicketConfirmé(ticket);
  };

  return (
    <KeyboardAvoidingView
      style={styles.racine}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.défilement}>
        {/* En-tête */}
        <Text style={styles.titre}>MonTour</Text>
        <Text style={styles.sousTitre}>Urgences · {HOPITAL_DÉMO}</Text>

        {/* Saisie du numéro de ticket */}
        <View style={styles.sectionSaisie}>
          <Text style={styles.étiquetteSaisie}>Votre numéro de ticket</Text>
          <View style={styles.rangéeSaisie}>
            <TextInput
              style={styles.champTexte}
              value={saisieTicket}
              onChangeText={setSaisieTicket}
              placeholder="ex. A004"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={confirmerTicket}
            />
            <TouchableOpacity style={styles.boutonConfirmer} onPress={confirmerTicket}>
              <Text style={styles.texteBouton}>Suivre</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton scan — ouvre l'écran OCR caméra */}
          <TouchableOpacity
            style={styles.boutonScanner}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.texteBoutonScanner}>📷  Scanner mon ticket</Text>
          </TouchableOpacity>
        </View>

        {/* État de chargement */}
        {chargement && (
          <ActivityIndicator size="large" color="#1565C0" style={styles.chargement} />
        )}

        {/* Erreur */}
        {erreur && <Text style={styles.texteErreur}>{erreur}</Text>}

        {/* Résultats */}
        {données && !chargement && (
          <View style={styles.sectionRésultats}>
            {/* Numéro de position affiché en grand */}
            <View style={styles.cartePrincipale}>
              <Text style={styles.étiquettePosition}>Votre position</Text>
              <Text style={styles.numéroPosition}>{données.position}</Text>
              <Text style={styles.texteTicket}>Ticket {données.ticket}</Text>
            </View>

            {/* Barre de progression colorée */}
            <BarreProgression
              position={données.position}
              total={données.totalEnAttente}
              couleurAlerte={données.alerte}
            />

            {/* Temps d'attente estimé */}
            <Text style={styles.estimationTemps}>
              Attente estimée : ~{données.minutesEstimées} min
            </Text>

            {/* Bandeau d'alerte couleur */}
            <BandeauAlerte alerte={données.alerte} />

            {/* Bouton d'actualisation manuelle */}
            <TouchableOpacity style={styles.boutonActualiser} onPress={actualiser}>
              <Text style={styles.texteBoutonActualiser}>Actualiser</Text>
            </TouchableOpacity>

            <Text style={styles.misÀJour}>
              Mis à jour à {new Date(données.misAJourÀ).toLocaleTimeString('fr-CA')}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  racine: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  défilement: {
    padding: 24,
    paddingTop: 48,
  },
  titre: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1565C0',
    textAlign: 'center',
  },
  sousTitre: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 4,
  },
  sectionSaisie: {
    marginBottom: 24,
  },
  étiquetteSaisie: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  rangéeSaisie: {
    flexDirection: 'row',
    gap: 10,
  },
  champTexte: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    backgroundColor: '#fff',
    letterSpacing: 2,
  },
  boutonConfirmer: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  texteBouton: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  boutonScanner: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  texteBoutonScanner: {
    color: '#1565C0',
    fontWeight: '600',
    fontSize: 14,
  },
  chargement: {
    marginTop: 32,
  },
  texteErreur: {
    color: '#C62828',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  sectionRésultats: {
    marginTop: 8,
  },
  cartePrincipale: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  étiquettePosition: {
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  numéroPosition: {
    fontSize: 80,
    fontWeight: '900',
    color: '#1565C0',
    lineHeight: 90,
  },
  texteTicket: {
    fontSize: 14,
    color: '#aaa',
  },
  estimationTemps: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    color: '#555',
  },
  boutonActualiser: {
    marginHorizontal: 24,
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  texteBoutonActualiser: {
    color: '#1565C0',
    fontWeight: '600',
    fontSize: 15,
  },
  misÀJour: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#bbb',
  },
});

export default AccueilScreen;
