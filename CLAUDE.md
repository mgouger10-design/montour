# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MonTour** is a mobile app that lets ER patients track their queue position in real time. The patient enters their ticket number on arrival, then leaves the hospital — the app notifies them when their turn is approaching so they can come back in time.

* **MonTour** — public-facing consumer app (patients)
* **FileSanté** — institutional version (hospitals, staff dashboards)

Stack : **Expo SDK 52** (mobile) + **Node.js/Express** (backend).

## Core Problem

Quebec ER wait times average several hours. Patients currently must stay in the waiting room the entire time. MonTour lets them wait anywhere nearby and return only when needed, reducing crowding and improving the patient experience.

## Key Domain Concepts

* **Ticket number** — the paper number given to a patient at triage; the primary identifier linking a patient to their queue position
* **Queue position** — estimated place in line, derived from the hospital's queue data (not necessarily the raw ticket number, since triage priority affects order)
* **Notification threshold** — how many positions ahead of the patient's turn to send the "come back now" alert (configurable, default TBD)
* **FileSanté feed** — the institutional data source; hospitals must expose queue state for the app to function. Integration model (API, scraping, partnership) is a key open question.

## Architecture Considerations

The system has three distinct layers that must be designed together:

1. **Data ingestion** — how MonTour gets live queue data from each hospital. Options: direct hospital API partnership, screen-scraping public displays, manual staff updates via FileSanté. This is the critical dependency.
2. **Backend / queue engine** — tracks patient positions, computes ETAs, triggers notification events. Must handle multiple hospitals concurrently and be resilient to gaps in hospital data feeds.
3. **Mobile client** — patient-facing. Enters ticket number, receives push notifications, shows estimated wait. Needs to work with minimal interaction after initial setup.

## Stack technique

- **Mobile** : Expo SDK 52 (Expo Go, workflow géré), React Navigation (native-stack)
- **Backend** : Node.js + Express, Tesseract.js pour l'OCR
- Polling toutes les 30 secondes depuis le mobile (`usePositionFile.js`)
- OCR : photo capturée par `expo-camera`, redimensionnée par `expo-image-manipulator`, envoyée au backend en base64 → Tesseract extrait le numéro de ticket

> `expo-barcode-scanner` est déprécié depuis SDK 51. La lecture de codes-barres est intégrée dans `expo-camera` via `onBarcodeScanned`. L'OCR de texte libre passe par le backend Tesseract.

## Commandes

### Backend (`/backend`)
```bash
npm install
npm run dev      # démarrage avec rechargement automatique (nodemon)
npm start        # production
```
API accessible sur `http://localhost:3000`.
- `GET  /api/file/HMR/A004` — position dans la file
- `POST /api/ocr/lire-ticket` — OCR d'une image (body JSON `{ image: "<base64>" }`)

> Tesseract.js télécharge les données de langue (~10 Mo) au premier appel OCR. Les appels suivants utilisent le cache.

### Mobile (`/mobile`)
```bash
npm install
npx expo start          # démarrer (scanner le QR avec Expo Go)
npx expo start --android
npx expo start --ios
```
En développement sur émulateur Android, `10.0.2.2` pointe vers `localhost` de la machine hôte (voir `src/services/api.js`).

## Open Decisions

* Intégration des données hospitalières (le problème le plus difficile) — actuellement simulée dans `backend/src/data/fileSimulee.js`
* Tickets uniques par système ou par hôpital
* Notifications push vs SMS (fallback pour patients sans téléphone)
* Conformité aux lois québécoises sur la santé (Loi 25, LSSSS)

