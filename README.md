Commande ECHO activ�e.
voici l arbre du dossier 
connectsphere/
│
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── images/
│
├── config/
│   └── database.php
│
├── controllers/
│   ├── AuthController.php
│   ├── UserController.php
│   ├── PostController.php
│   ├── MessageController.php
│   └── GroupController.php
│
├── models/
│   ├── User.php
│   ├── Post.php
│   ├── Comment.php
│   ├── Like.php
│   ├── Message.php
│   └── Group.php
│
├── views/
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── profile/
│   │   └── view.php
│   ├── posts/
│   │   └── feed.php
│   ├── messages/
│   │   └── inbox.php
│   ├── groups/
│   │   └── list.php
│   └── layout/
│       ├── header.php
│       └── footer.php
│
├── includes/
│   └── functions.php
│
├── public/
│   ├── index.php
│   └── .htaccess
│
└── README.md
  
les taches leur repartition================= 

Membre | Tâche principale
Membre 1 | Authentification (register/login/logout)
Membre 2 | Profil utilisateur (édition, affichage)
Membre 3 | Publications + affichage fil d’actualité
Membre 4 | Commentaires et likes
Membre 5 | Messagerie instantanée
Membre 6 | Système d’amis
Membre 7 | Groupes (discussion + publication)
Membre 8 | Signalement / blocage / modération
Membre 9 | Base de données + sécurisation globale
Membre 10| Front-End général : responsive / design UI ( c est une supervision general)

couleur====================

Couleur | Hex | Usage
Bleu-violet | #5865F2 | Couleur principale
Bleu clair | #99AAB5 | Hover, bordures
Noir bleuté | #2C2F33 | Texte et éléments foncés
Blanc pur | #FFFFFF | Fond des cartes
Gris clair | #F5F5F5 | Fond général
Vert doux | #43B581 | Statut en ligne, confirmations
Rouge clair | #F04747 | Alertes, erreurs