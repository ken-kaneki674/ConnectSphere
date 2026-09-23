# ConnectSphere Backend API

## 🚀 Installation

```bash
cd backend
npm install
```

## 📝 Configuration

Copiez `.env.example` vers `.env` et ajustez les variables (le serveur refuse de démarrer sans `JWT_SECRET`) :

```bash
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=connectsphere
JWT_SECRET=<valeur aléatoire, ex. : node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

## 🏃‍♂️ Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## 📚 Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription  
- `GET /api/auth/profile` - Profil utilisateur

### Publications
- `GET /api/posts` - Lister les posts
- `POST /api/posts` - Créer un post
- `GET /api/posts/:id` - Voir un post
- `DELETE /api/posts/:id` - Supprimer un post

### Commentaires
- `GET /api/comments/:postId` - Commentaires d'un post
- `POST /api/comments/:postId` - Ajouter un commentaire
- `DELETE /api/comments/:commentId` - Supprimer un commentaire

### Likes
- `POST /api/likes/:postId` - Like/Unlike un post
- `GET /api/likes/:postId` - Likes d'un post
- `GET /api/likes/:postId/check` - Vérifier si liké

### Messages
- `GET /api/messages/conversations` - Conversations
- `GET /api/messages/conversations/:id` - Messages d'une conversation
- `POST /api/messages/conversations/:id` - Envoyer un message
- `POST /api/messages/conversations` - Nouvelle conversation

### Groupes
- `GET /api/groups` - Groupes de l'utilisateur
- `GET /api/groups/:id` - Détails d'un groupe
- `POST /api/groups` - Créer un groupe
- `POST /api/groups/:id/join` - Rejoindre un groupe
- `POST /api/groups/:id/leave` - Quitter un groupe
- `DELETE /api/groups/:id` - Supprimer un groupe

## 🔑 Compte de test

- **Username**: `demo`
- **Password**: `demo`

## 🗄️ Base de données

Le backend fonctionne en mode développement avec des données simulées. Pour une base de données MySQL, créez les tables avec le schéma `connectsphere_schema.sql`.
