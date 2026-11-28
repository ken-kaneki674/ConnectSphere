export const initialUsers = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@connectsphere.com',
    bio: 'Membre actif de ConnectSphere 🌐',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 2,
    username: 'Sophie_Dev',
    email: 'sophie@connectsphere.com',
    bio: 'Fullstack JS / React Native ⚡️ Passionnée par les API propres.',
    profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 3,
    username: 'Alex_Design',
    email: 'alex@connectsphere.com',
    bio: 'Lead Designer UI/UX 🎨 Fan de dark mode & typographie.',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 4,
    username: 'Marc_Cloud',
    email: 'marc@connectsphere.com',
    bio: 'DevOps & Cloud Architect 🚀 Node.js / Docker / MySQL.',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
];

export const initialPosts = [
  {
    id: 1,
    content: "Bienvenue sur ConnectSphere Mobile ! 🚀 Découvrez la nouvelle expérience connectée en React Native. Rejoignez les groupes et partagez avec la communauté.",
    user: {
      id: 1,
      username: 'demo',
      profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes_count: 24,
    comments_count: 2,
    is_liked: false,
    image_path: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  },
  {
    id: 2,
    content: "On vient de déployer la nouvelle mise à jour de l'API ConnectSphere avec Express et MySQL. Les temps de réponse sont ultra rapides ! ⚡️ #dev #nodejs",
    user: {
      id: 2,
      username: 'Sophie_Dev',
      profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes_count: 18,
    comments_count: 1,
    is_liked: true,
    image_path: null,
  },
  {
    id: 3,
    content: "Nouveau projet d'interface mobile pour ConnectSphere : découvrez la navigation par onglets et le mode sombre intégré ! Vous préférez quel thème ? 🎨",
    user: {
      id: 3,
      username: 'Alex_Design',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    likes_count: 42,
    comments_count: 0,
    is_liked: false,
    image_path: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
  },
];

export const initialGroups = [
  {
    id: 1,
    name: 'Développeurs Web & Mobile',
    description: 'Communauté des développeurs React Native, Vue, Node.js et PHP.',
    group_type: 'feed',
    members_count: 248,
    is_member: true,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
  },
  {
    id: 2,
    name: 'Design & UX/UI Sphère',
    description: 'Partagez vos maquettes Figma, retours utilisateurs et bonnes pratiques.',
    group_type: 'chat',
    members_count: 135,
    is_member: false,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
  },
  {
    id: 3,
    name: 'Tech, AI & Startups',
    description: 'Les dernières tendances technologiques, intelligence artificielle et entrepreneuriat.',
    group_type: 'feed',
    members_count: 412,
    is_member: true,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300',
  },
  {
    id: 4,
    name: 'Gaming & Loisirs',
    description: 'Discussions chill, parties en ligne et partages de stream.',
    group_type: 'chat',
    members_count: 89,
    is_member: false,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300',
  },
];

export const initialGroupPosts = {
  1: [
    {
      id: 101,
      group_id: 1,
      content: "Astuce React Native : utilisez useFocusEffect pour rafraîchir automatiquement les écrans quand l'utilisateur revient dessus ! 📱",
      user: {
        id: 2,
        username: 'Sophie_Dev',
        profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      likes_count: 11,
      comments_count: 1,
      is_liked: false,
      image_path: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    },
  ],
};

export const initialGroupMessages = {
  2: [
    {
      id: 201,
      group_id: 2,
      sender_id: 3,
      username: 'Alex_Design',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content: 'Bienvenue dans le salon Design ! Quels outils utilisez-vous cette semaine ?',
      sent_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  4: [
    {
      id: 202,
      group_id: 4,
      sender_id: 4,
      username: 'Marc_Cloud',
      profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      content: 'Qui est dispo ce soir pour une session coop ?',
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

export const initialConversations = [
  {
    id: 1,
    user: {
      id: 2,
      username: 'Sophie_Dev',
      profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      is_online: true,
    },
    last_message: "Super ! J'ai vu la version mobile React Native, c'est très fluide !",
    unread_count: 2,
    updated_at: new Date(Date.now() - 60000 * 15).toISOString(),
    messages: [
      { id: 1, sender_id: 2, content: "Salut ! Tu as pu tester l'application mobile ?", sent_at: new Date(Date.now() - 60000 * 25).toISOString() },
      { id: 2, sender_id: 1, content: "Oui tout fonctionne, l'authentification et les posts sont prêts !", sent_at: new Date(Date.now() - 60000 * 20).toISOString() },
      { id: 3, sender_id: 2, content: "Super ! J'ai vu la version mobile React Native, c'est très fluide !", sent_at: new Date(Date.now() - 60000 * 15).toISOString() },
    ],
  },
  {
    id: 2,
    user: {
      id: 3,
      username: 'Alex_Design',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      is_online: false,
    },
    last_message: 'Les couleurs du mode sombre rendent super bien sur mobile.',
    unread_count: 0,
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      { id: 4, sender_id: 3, content: "Hello ! J'ai peaufiné les contrastes pour l'écran de profil.", sent_at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { id: 5, sender_id: 3, content: 'Les couleurs du mode sombre rendent super bien sur mobile.', sent_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
  },
];

export const initialComments = {
  1: [
    {
      id: 1,
      user: { id: 2, username: 'Sophie_Dev', profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      content: 'Félicitations pour le portage mobile ! 🎉',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      user: { id: 3, username: 'Alex_Design', profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      content: 'Design au top, très agréable sur smartphone.',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  2: [
    {
      id: 3,
      user: { id: 1, username: 'demo', profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      content: 'Excellent travail sur les routes Express !',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  3: [],
};

export const initialFriendRequests = [
  { id: 1, sender_id: 1, receiver_id: 2, status: 1, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 2, sender_id: 4, receiver_id: 1, status: 0, created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
];
