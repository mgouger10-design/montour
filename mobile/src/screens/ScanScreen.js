import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { envoyerImageOCR } from '../services/api';

// Note : expo-barcode-scanner est déprécié depuis SDK 51.
// La lecture de codes-barres est désormais intégrée directement dans expo-camera via onBarcodeScanned.
// Pour l'OCR de texte libre (numéros imprimés sur billets ou écrans), on capture une photo
// et on la transmet au backend qui utilise Tesseract.js.

// Modèle attendu pour un numéro de ticket québécois : une lettre suivie de 2 à 4 chiffres
const REGEX_TICKET = /[A-Z]\d{2,4}/;

const ScanScreen = ({ navigation }) => {
  const [permission, demanderPermission] = useCameraPermissions();
  const refCaméra = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [ticketDétecté, setTicketDétecté] = useState('');
  const [saisieMannuelle, setSaisieManuelle] = useState('');
  const [analyse, setAnalyse] = useState(false);
  const [erreur, setErreur] = useState(null);

  // --- Gestion des permissions ---

  if (!permission) {
    return <View style={styles.centré}><ActivityIndicator size="large" color="#1565C0" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centré}>
        <Text style={styles.textePermission}>
          L'accès à la caméra est requis pour scanner votre numéro de ticket.
        </Text>
        <TouchableOpacity style={styles.boutonPrincipal} onPress={demanderPermission}>
          <Text style={styles.texteBouton}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Capture et analyse ---

  const capturerEtAnalyser = async () => {
    if (!refCaméra.current) return;
    setErreur(null);
    setTicketDétecté('');
    setSaisieManuelle('');

    try {
      // Capturer en haute résolution
      const photo = await refCaméra.current.takePictureAsync({ quality: 1, base64: false });

      // Réduire la taille avant envoi pour limiter le poids du payload
      const imageOptimisée = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.85, format: SaveFormat.JPEG, base64: true },
      );

      setPhotoUri(photo.uri);
      setAnalyse(true);

      const résultat = await envoyerImageOCR(imageOptimisée.base64);

      // Vérifier que le ticket détecté correspond au format attendu
      const correspond = résultat.ticket && REGEX_TICKET.test(résultat.ticket);
      if (correspond) {
        setTicketDétecté(résultat.ticket);
      } else {
        // OCR n'a pas trouvé de numéro valide — proposer la saisie manuelle
        setSaisieManuelle('');
        setErreur('Aucun numéro de ticket reconnu. Corrigez ou saisissez-le manuellement.');
      }
    } catch (e) {
      setErreur(`Erreur lors de l'analyse : ${e.message}`);
    } finally {
      setAnalyse(false);
    }
  };

  const recommencer = () => {
    setPhotoUri(null);
    setTicketDétecté('');
    setSaisieManuelle('');
    setErreur(null);
  };

  const confirmerTicket = () => {
    const ticket = (ticketDétecté || saisieMannuelle).trim().toUpperCase();
    if (!ticket) {
      Alert.alert('Ticket manquant', 'Veuillez entrer ou scanner un numéro de ticket.');
      return;
    }
    // Retourner le ticket confirmé à l'écran d'accueil
    navigation.navigate('Accueil', { ticketPrédéfini: ticket });
  };

  // --- Affichage ---

  // État A : aperçu caméra (pas encore de photo)
  if (!photoUri) {
    return (
      <View style={styles.racine}>
        <CameraView ref={refCaméra} style={styles.caméra} facing="back">
          {/* Cadre de visée pour guider l'utilisateur */}
          <View style={styles.surcoucheCaméra}>
            <Text style={styles.consigne}>
              Pointez la caméra vers votre numéro de ticket
            </Text>
            <View style={styles.cadreVise} />
            <TouchableOpacity style={styles.boutonCapture} onPress={capturerEtAnalyser}>
              <View style={styles.boutonCaptureIntérieur} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // État B : photo capturée — afficher résultat et options
  return (
    <View style={styles.racine}>
      <Image source={{ uri: photoUri }} style={styles.aperçuPhoto} resizeMode="cover" />

      <View style={styles.panneau}>
        {analyse ? (
          <>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.texteAnalyse}>Lecture du ticket en cours…</Text>
          </>
        ) : (
          <>
            {ticketDétecté ? (
              <>
                <Text style={styles.étiquetteRésultat}>Ticket détecté</Text>
                <Text style={styles.ticketDétecté}>{ticketDétecté}</Text>
              </>
            ) : (
              <>
                {erreur && <Text style={styles.texteErreur}>{erreur}</Text>}
                <Text style={styles.étiquetteRésultat}>Saisir manuellement</Text>
                <TextInput
                  style={styles.champManuel}
                  value={saisieMannuelle}
                  onChangeText={setSaisieManuelle}
                  placeholder="ex. A004"
                  placeholderTextColor="#aaa"
                  autoCapitalize="characters"
                  autoFocus
                />
              </>
            )}

            <View style={styles.rangéeBoutons}>
              <TouchableOpacity style={styles.boutonSecondaire} onPress={recommencer}>
                <Text style={styles.texteBoutonSecondaire}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.boutonPrincipal} onPress={confirmerTicket}>
                <Text style={styles.texteBouton}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  racine: {
    flex: 1,
    backgroundColor: '#000',
  },
  centré: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  textePermission: {
    textAlign: 'center',
    color: '#555',
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },

  // --- Caméra ---
  caméra: {
    flex: 1,
  },
  surcoucheCaméra: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  consigne: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
  },
  cadreVise: {
    width: 220,
    height: 110,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    // Coins colorés pour guider la mise au point
    shadowColor: '#1565C0',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  boutonCapture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boutonCaptureIntérieur: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },

  // --- Résultat ---
  aperçuPhoto: {
    flex: 1,
    opacity: 0.4,
  },
  panneau: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  texteAnalyse: {
    marginTop: 12,
    color: '#555',
    fontSize: 14,
  },
  étiquetteRésultat: {
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  ticketDétecté: {
    fontSize: 56,
    fontWeight: '900',
    color: '#1565C0',
    letterSpacing: 4,
    marginBottom: 24,
  },
  texteErreur: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  champManuel: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
  },
  rangéeBoutons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  boutonPrincipal: {
    flex: 1,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  boutonSecondaire: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  texteBouton: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  texteBoutonSecondaire: {
    color: '#1565C0',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ScanScreen;
