# 📱 ConnectSphere Mobile (React Native + Expo)

Application mobile officielle de **ConnectSphere**, réseau social nouvelle génération pour développeurs, créateurs et communautés.

---

## 🌟 Fonctionnalités Mobile

- 🔐 **Authentification complète** : Inscription, Connexion sécurisée JWT et mode démo rapide (1-clic).
- 📰 **Fil d'actualité (Feed)** :
  - Publications avec avatars, photos, descriptions, badges.
  - Système de Likes en temps réel avec compteurs.
  - Filtres dynamiques : Récents, Tendances 🔥, Médias 📸.
  - Pull-to-refresh (tirer pour rafraîchir).
- ✍️ **Création de publications** :
  - Modal plein écran avec saisie de texte et ajout de photos (URL ou presets).
- 💬 **Commentaires** :
  - Visualisation des commentaires en temps réel sur chaque post.
  - Ajout instantané de commentaires avec mise à jour optimiste.
- 👥 **Groupes & Communautés** :
  - Liste des groupes (Fils de discussion et Salons Chat).
  - Détail du groupe, statistiques et bouton Rejoindre / Quitter.
  - Création de nouveaux groupes avec choix du type.
- 📬 **Messagerie & Tchat en direct** :
  - Liste des conversations avec statut en ligne et badges de messages non lus.
  - Interface de tchat complète avec bulles de messages et réponses interactives.
- 🔍 **Recherche & Tendances** :
  - Recherche instantanée de membres et de publications.
  - Tags et hashtags populaires (#ReactNative, #ConnectSphere, #DevWeb).
- 👤 **Profil utilisateur & Paramètres** :
  - Statistiques (Posts, Amis, Groupes).
  - Basculeur de **Mode Sombre / Mode Clair**.
  - Modification du profil (nom, bio, photo).
  - Déconnexion sécurisée.

---

## 🚀 Démarrage Rapide

### 1. Installer les dépendances
Dans le dossier `mobile/` :
```bash
cd mobile
npm install
```

### 2. Lancer l'application
```bash
npx expo start
```

### 3. Visualiser l'application :
- **Sur votre smartphone physique** : Installez l'application **Expo Go** (Android / iOS) et scannez le QR code affiché dans votre terminal.
- **Sur Android Emulator** : Appuyez sur la touche `a` dans le terminal.
- **Sur iOS Simulator (Mac)** : Appuyez sur la touche `i` dans le terminal.
- **Sur navigateur Web** : Appuyez sur la touche `w` dans le terminal.

---

## 🔌 Connexion au Backend

L'application mobile est configurée pour communiquer avec l'API Express de ConnectSphere (`backend/server.js`) :
- Port par défaut : `http://localhost:8000/api` (Web) ou `http://10.0.2.2:8000/api` (Android Emulator).
- **Mode hors-ligne / Démo intégré** : Si le serveur Node/MySQL n'est pas lancé, l'application fonctionne immédiatement grâce à son magasin de données interactif embarqué !
