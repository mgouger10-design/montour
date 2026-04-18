import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CONFIG_ALERTES = {
  vert: {
    fond: '#E8F5E9',
    texte: '#2E7D32',
    message: 'Encore du temps — vous pouvez attendre ailleurs.',
    icône: '🟢',
  },
  jaune: {
    fond: '#FFF8E1',
    texte: '#F57F17',
    message: 'Prévoyez de partir bientôt.',
    icône: '🟡',
  },
  rouge: {
    fond: '#FFEBEE',
    texte: '#C62828',
    message: 'Votre tour approche — retournez à l\'urgence maintenant.',
    icône: '🔴',
  },
};

// Bandeau coloré indiquant l'urgence de retourner à l'hôpital
const BandeauAlerte = ({ alerte }) => {
  const config = CONFIG_ALERTES[alerte];
  if (!config) return null;

  return (
    <View style={[styles.bandeau, { backgroundColor: config.fond }]}>
      <Text style={styles.icône}>{config.icône}</Text>
      <Text style={[styles.message, { color: config.texte }]}>{config.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  icône: {
    fontSize: 22,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default BandeauAlerte;
