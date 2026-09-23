# ConnectSphere 🌐

Une plateforme de réseau social complète développée en équipe, offrant plusieurs versions technologiques pour répondre à différents besoins de développement.

## 📋 Description du projet

ConnectSphere est une application de réseau social moderne qui permet aux utilisateurs de:
- Créer un compte et se connecter
- Publier du contenu sur un fil d'actualité
- Interagir avec les posts (likes, commentaires)
- Échanger des messages privés
- Rejoindre et créer des groupes
- Gérer leur profil utilisateur

## 🏗️ Architecture du projet

Le projet existe en **trois versions**:

### 1. Version PHP Original (Architecture MVC)
- **Frontend**: PHP pur avec templates
- **Backend**: PHP avec architecture MVC
- **Base de données**: MySQL/MariaDB
- **Dossier**: `controllers/`, `models/`, `views/`, `public/`
- **Démarrage**: `php -S localhost:8081` à la racine du projet, puis http://localhost:8081/public/index.php

### 2. Version Vue.js + API PHP (Architecture SPA)
- **Frontend**: Vue.js 3 avec Vue Router et Vuex
- **Backend**: API REST PHP
- **Base de données**: MySQL/MariaDB
- **Dossier**: `src/`, `api/`
- **Documentation**: Voir `README-VUE.md`

### 3. Version Node.js + Vue.js (Architecture Full-Stack JS)
- **Frontend**: Vue.js 3
- **Backend**: Node.js avec Express
- **Base de données**: MySQL2 (ou données simulées pour le développement)
- **Dossier**: `src/`, `backend/`
- **Documentation**: Voir `README-NODE.md`

## 🚀 Installation

### Prérequis communs
- Node.js 16+
- PHP 8+ (pour versions PHP)
- MySQL/MariaDB (pour versions avec base de données)

### Installation rapide (Version recommandée: Vue.js + Node.js)

```bash
# Cloner le dépôt
git clone https://github.com/lawsonoris/ConnectSphere.git
cd ConnectSphere

# Installer les dépendances frontend
npm install

# Importer la base de données (crée « connectsphere » + compte demo/demo)
mysql -u root -p < connectsphere_schema.sql

# Installer les dépendances backend et créer sa configuration
cd backend
npm install
cp .env.example .env   # renseignez DB_* et un JWT_SECRET aléatoire
cd ..

# Démarrer avec le script automatique (Windows)
start.bat
```

### Installation manuelle

**Backend Node.js (Terminal 1)**
```bash
cd backend
npm start
```

**Frontend Vue.js (Terminal 2)**
```bash
npm run serve
```

## 🌐 Points d'accès

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000/api
- **Compte de test**: Username: `demo` (email `demo@connectsphere.local`), Password: `demo`

## 📁 Structure du projet

```
ConnectSphere/
├── api/                    # API REST PHP (même contrat que le backend Node)
│   ├── index.php          # Routeur
│   └── lib.php            # JWT, requêtes, mise en forme
├── backend/               # Backend Node.js
│   ├── config/            # Connexion MySQL
│   ├── middleware/        # Authentification JWT
│   ├── utils/             # Requêtes partagées
│   └── routes/            # Routes API
├── src/                   # Application Vue.js
│   ├── components/        # Composants réutilisables
│   ├── views/            # Pages de l'application
│   ├── store/            # Gestion d'état Vuex
│   ├── router/           # Router Vue
│   └── services/         # Services API
├── controllers/           # Contrôleurs PHP (version MVC)
├── models/               # Modèles PHP (version MVC)
├── views/                # Vues PHP (version MVC)
├── config/               # Configuration PHP
├── public/               # Fichiers publics PHP
├── assets/               # Assets statiques
├── connectsphere_schema.sql  # Schéma de base de données
├── server.php            # Point d'entrée « php -S » de l'API PHP
└── package.json          # Dépendances Node.js
```

## 🎨 Fonctionnalités

- ✅ **Authentification**: Inscription, connexion, déconnexion
- ✅ **Fil d'actualité**: Publication et affichage des posts
- ✅ **Interactions**: Likes et commentaires sur les posts
- ✅ **Messagerie**: Messages privés entre utilisateurs
- ✅ **Groupes**: Création et gestion de groupes
- ✅ **Profils**: Gestion et affichage des profils utilisateurs
- ✅ **Design responsive**: Adapté mobile/tablette/desktop
- ✅ **API REST**: Backend complet et documenté

## 🎨 Thème et couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Bleu-violet | #5865F2 | Couleur principale |
| Bleu clair | #99AAB5 | Hover, bordures |
| Noir bleuté | #2C2F33 | Texte et éléments foncés |
| Blanc pur | #FFFFFF | Fond des cartes |
| Gris clair | #F5F5F5 | Fond général |
| Vert doux | #43B581 | Statut en ligne, confirmations |
| Rouge clair | #F04747 | Alertes, erreurs |

## 👥 Répartition des tâches (Équipe)

| Membre | Tâche principale |
|--------|------------------|
| Membre 1 | Authentification (register/login/logout) |
| Membre 2 | Profil utilisateur (édition, affichage) |
| Membre 3 | Publications + affichage fil d'actualité |
| Membre 4 | Commentaires et likes |
| Membre 5 | Messagerie instantanée |
| Membre 6 | Système d'amis |
| Membre 7 | Groupes (discussion + publication) |
| Membre 8 | Signalement / blocage / modération |
| Membre 9 | Base de données + sécurisation globale |
| Membre 10 | Front-End général : responsive / design UI |

## 🛠️ Technologies utilisées

### Frontend
- **Vue.js 3**: Framework JavaScript progressif
- **Vue Router**: Gestion du routing
- **Vuex**: Gestion d'état centralisée
- **Bootstrap 5**: Framework CSS responsive
- **Axios**: Client HTTP pour les appels API

### Backend (Version Node.js)
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **JWT**: Authentification par tokens
- **MySQL2**: Client MySQL pour Node.js

### Backend (Version PHP)
- **PHP 8+**: Langage serveur
- **MySQL/MariaDB**: Base de données relationnelle
- **Architecture MVC**: Séparation des concerns

## 📚 Documentation supplémentaire

- **Version Vue.js + PHP**: Voir `README-VUE.md`
- **Version Node.js**: Voir `README-NODE.md`
- **Schéma de base de données**: Voir `connectsphere_schema.sql`

## 🔧 Configuration de la base de données

```bash
# Importer le schéma (crée la base « connectsphere »)
mysql -u root -p < connectsphere_schema.sql
```

## 🐛 Dépannage

### Erreur "Network Error"
1. Vérifiez que le backend est démarré (http://localhost:8000/api/posts)
   - une erreur 500 indique en général que MySQL est arrêté ou que le schéma n'est pas importé
2. Vérifiez que les ports 8000 et 8080 sont disponibles
3. Vérifiez votre firewall

### Problèmes de dépendances
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notes de développement

Le projet a évolué d'une architecture PHP pur vers une architecture moderne avec:
- Séparation claire frontend/backend
- Interface utilisateur réactive
- API RESTful
- Gestion d'état centralisée
- Code maintenable et scalable

## 📄 Licence

Ce projet est développé dans un cadre éducatif.

## 👨‍💻 Contributeurs

Projet développé en équipe par 10 membres.