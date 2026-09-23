# ConnectSphere - Version Node.js

## 🚀 Démarrage rapide

### Option 1 : Script automatique (Windows)
```bash
start.bat
```

### Option 2 : Manuel

**Base de données (une seule fois)**
```bash
mysql -u root -p < connectsphere_schema.sql
```

**Backend (Terminal 1)**
```bash
cd backend
npm install
cp .env.example .env   # puis renseignez DB_* et un JWT_SECRET aléatoire
npm start
```

**Frontend (Terminal 2)**
```bash
npm install
npm run serve
```

## 🌐 Accès

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:8000/api

## 🔑 Compte de test

- **Username** : `demo`
- **Password** : `demo`

## 🐛 Correction des erreurs réseau

Si vous avez une erreur "Network Error" :

1. **Vérifiez que le backend est démarré** :
   - Ouvrez http://localhost:8000/api/posts dans votre navigateur
   - Vous devriez voir des données JSON
   - Une erreur 500 signifie en général que MySQL n'est pas démarré ou que le schéma n'est pas importé

2. **Vérifiez les ports** :
   - Backend : 8000
   - Frontend : 8080

3. **CORS** : Déjà configuré dans le backend

4. **Firewall** : Autorisez les ports 8000 et 8080

## 📚 API Endpoints

### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil

### Posts
- `GET /api/posts` - Tous les posts
- `POST /api/posts` - Créer un post
- `GET /api/posts/:id` - Voir un post
- `DELETE /api/posts/:id` - Supprimer son post
- `GET /api/posts/:id/comments` - Commentaires
- `POST /api/posts/:id/comments` - Ajouter un commentaire
- `POST /api/posts/:id/like` - Like/Unlike
- `GET /api/posts/:id/likes` - Liste des likes

### Comments / Likes (alias)
- `GET|POST /api/comments/:postId`, `DELETE /api/comments/:commentId`
- `GET|POST /api/likes/:postId`, `GET /api/likes/:postId/check`

### Users
- `GET /api/users/search?q=` - Rechercher un utilisateur
- `GET /api/users/:id` - Profil public
- `GET /api/users/:id/posts` - Publications d'un utilisateur

### Messages
- `GET /api/messages/conversations` - Conversations
- `POST /api/messages/conversations` - Démarrer (`{ username }` ou `{ recipientId }`)
- `GET /api/messages/conversations/:id` - Messages
- `POST /api/messages/conversations/:id` - Envoyer

### Groups
- `GET /api/groups` - Groupes
- `POST /api/groups` - Créer un groupe
- `GET|PUT|DELETE /api/groups/:id` - Voir / modifier / supprimer (admin)
- `POST /api/groups/:id/join` - Rejoindre
- `POST /api/groups/:id/leave` - Quitter

## 🛠️ Technologies

- **Frontend** : Vue.js 3, Vue Router, Vuex, Bootstrap 5
- **Backend** : Node.js, Express, JWT, MySQL2
- **Base de données** : MySQL/MariaDB (schéma `connectsphere_schema.sql`, compte `demo` inclus)

## 🎨 Fonctionnalités

- ✅ Authentification JWT
- ✅ Fil d'actualité
- ✅ Likes et commentaires
- ✅ Messagerie privée
- ✅ Groupes
- ✅ Design responsive
- ✅ API REST complète
