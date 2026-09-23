# ConnectSphere - Vue.js Version

## 🚀 Installation

### Prérequis
- Node.js 16+
- PHP 8+
- MySQL/MariaDB

### Configuration

1. **Installer les dépendances Vue.js**
```bash
npm install
```

2. **Configurer la base de données**
```bash
# Importer le schéma (crée la base « connectsphere » et le compte demo/demo)
mysql -u root -p < connectsphere_schema.sql
```

3. **Configurer l'API backend**
```bash
# Démarrer le serveur PHP (même contrat d'API que le backend Node)
php -S localhost:8000 server.php
# Le secret JWT est lu dans la variable JWT_SECRET, sinon dans backend/.env
```

4. **Démarrer le frontend Vue.js**
```bash
npm run serve
```

## 📁 Structure du projet

```
connectsphere/
├── api/                    # API REST PHP
│   ├── index.php          # Routeur (auth, posts, commentaires, likes, users, messages, groupes)
│   └── lib.php            # JWT, requêtes et mise en forme
├── src/                   # Application Vue.js
│   ├── components/        # Composants réutilisables
│   ├── views/            # Pages de l'application
│   ├── store/            # Gestion d'état Vuex
│   ├── router/           # Router Vue
│   └── services/         # Services API
├── public/               # Fichiers publics
└── assets/              # Assets statiques
```

## 🎨 Fonctionnalités

- ✅ **Authentification** : Login/Register
- ✅ **Fil d'actualité** : Posts avec images
- ✅ **Interactions** : Likes et commentaires
- ✅ **Design responsive** : Bootstrap 5
- ✅ **API REST** : Backend PHP
- ✅ **Gestion d'état** : Vuex
- ✅ **Routing** : Vue Router

## 🐛 Corrections apportées

1. **Variable inconsistante** : `$postController` → `$controller`
2. **Fichiers corrompus** : Remplacement des fichiers "Commande ECHO activée" par de vraies implémentations
3. **Architecture** : Séparation claire frontend/backend
4. **Sécurité** : Tokens JWT pour l'authentification
5. **Performance** : Chargement asynchrone des données

## 🌐 Points d'accès

- **Frontend** : http://localhost:8080
- **API Backend** : http://localhost:8000/api
- **Base de données** : MySQL/MariaDB

## 🎯 Couleurs du thème

- **Principal** : #5865F2 (Bleu-violet)
- **Secondaire** : #99AAB5 (Bleu clair)
- **Sombre** : #2C2F33 (Noir bleuté)
- **Clair** : #FFFFFF (Blanc pur)
- **Fond** : #F5F5F5 (Gris clair)
- **Succès** : #43B581 (Vert doux)
- **Danger** : #F04747 (Rouge clair)

## 📝 Notes de développement

Le projet a été entièrement converti de PHP pur à une architecture moderne Vue.js + API REST PHP, offrant :
- Meilleure séparation des concerns
- Interface utilisateur réactive
- Gestion d'état centralisée
- API RESTful
- Code maintenable et scalable
