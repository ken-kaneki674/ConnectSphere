# ConnectSphere - Version Node.js

## 🚀 Démarrage rapide

### Option 1 : Script automatique (Windows)
```bash
start.bat
```

### Option 2 : Manuel

**Backend (Terminal 1)**
```bash
cd backend
npm install
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

### Comments
- `GET /api/comments/:postId` - Commentaires
- `POST /api/comments/:postId` - Ajouter

### Likes
- `POST /api/likes/:postId` - Like/Unlike
- `GET /api/likes/:postId` - Liste des likes

### Messages
- `GET /api/messages/conversations` - Conversations
- `GET /api/messages/conversations/:id` - Messages
- `POST /api/messages/conversations/:id` - Envoyer

### Groups
- `GET /api/groups` - Groupes
- `POST /api/groups` - Créer un groupe
- `POST /api/groups/:id/join` - Rejoindre

## 🛠️ Technologies

- **Frontend** : Vue.js 3, Vue Router, Vuex, Bootstrap 5
- **Backend** : Node.js, Express, JWT, MySQL2
- **Développement** : Données simulées, pas de BDD requise

## 🎨 Fonctionnalités

- ✅ Authentification JWT
- ✅ Fil d'actualité
- ✅ Likes et commentaires
- ✅ Messagerie privée
- ✅ Groupes
- ✅ Design responsive
- ✅ API REST complète
