import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Affiche la progression dans la file sous forme de barre visuelle
const BarreProgression = ({ position, total, couleurAlerte }) => {
  const progression = total > 0 ? ((total - position + 1) / total) : 0;

  const couleurBarre = {
    vert: '#4CAF50',
    jaune: '#FFC107',
    rouge: '#F44336',
  }[couleurAlerte] ?? '#9E9E9E';

  return (
    <View style={styles.conteneur}>
      <View style={styles.piste}>
        <View
          style={[
            styles.remplissage,
            { width: `${progression * 100}%`, backgroundColor: couleurBarre },
          ]}
        />
      </View>
      <Text style={styles.étiquette}>
        {position} / {total} en attente
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  piste: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  remplissage: {
    height: '100%',
    borderRadius: 6,
  },
  étiquette: {
    marginTop: 6,
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
});

export default BarreProgression;
