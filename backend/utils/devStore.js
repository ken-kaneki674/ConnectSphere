// In-memory stateful store used when NODE_ENV=development or MySQL is unreachable
const bcrypt = require('bcryptjs');

let nextId = 100;
const genId = () => ++nextId;

const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@connectsphere.com',
    passwordHash: bcrypt.hashSync('demo', 10),
    bio: 'Membre actif de ConnectSphere 🌐',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 2,
    username: 'Sophie_Dev',
    email: 'sophie@connectsphere.com',
    passwordHash: bcrypt.hashSync('password', 10),
    bio: 'Fullstack JS / React Native ⚡️ Passionnée par les API propres.',
    profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 3,
    username: 'Alex_Design',
    email: 'alex@connectsphere.com',
    passwordHash: bcrypt.hashSync('password', 10),
    bio: 'Lead Designer UI/UX 🎨 Fan de dark mode & typographie.',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 4,
    username: 'Marc_Cloud',
    email: 'marc@connectsphere.com',
    passwordHash: bcrypt.hashSync('password', 10),
    bio: 'DevOps & Cloud Architect 🚀 Node.js / Docker / MySQL.',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

const posts = [
  {
    id: 1,
    user_id: 1,
    group_id: null,
    content: "Bienvenue sur ConnectSphere Mobile ! 🚀 Découvrez la nouvelle expérience connectée en React Native. Rejoignez les groupes et partagez avec la communauté.",
    image_path: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    user_id: 2,
    group_id: null,
    content: "On vient de déployer la nouvelle mise à jour de l'API ConnectSphere avec Express et MySQL. Les temps de réponse sont ultra rapides ! ⚡️ #dev #nodejs",
    image_path: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3,
    user_id: 3,
    group_id: null,
    content: "Nouveau projet d'interface mobile pour ConnectSphere : découvrez la navigation par onglets et le mode sombre intégré ! Vous préférez quel thème ? 🎨",
    image_path: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 4,
    user_id: 2,
    group_id: 1,
    content: "Astuce React Native : utilisez useFocusEffect pour rafraîchir automatiquement les écrans quand l'utilisateur revient dessus ! 📱",
    image_path: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// Set of `${postId}:${userId}` keys
const postLikes = new Set(['2:1', '1:2', '1:3', '3:2', '3:4']);

const comments = [
  {
    id: 1,
    post_id: 1,
    user_id: 2,
    content: "Félicitations pour le portage mobile ! 🎉",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    post_id: 1,
    user_id: 3,
    content: "Design au top, très agréable sur smartphone.",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    post_id: 2,
    user_id: 1,
    content: "Excellent travail sur les routes Express !",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const groups = [
  {
    id: 1,
    creator_id: 2,
    name: 'Développeurs Web & Mobile',
    description: 'Communauté des développeurs React Native, Vue, Node.js et PHP.',
    privacy: 'public',
    group_type: 'feed',
    base_members_count: 247,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 2,
    creator_id: 3,
    name: 'Design & UX/UI Sphère',
    description: 'Partagez vos maquettes Figma, retours utilisateurs et bonnes pratiques.',
    privacy: 'public',
    group_type: 'chat',
    base_members_count: 134,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 3,
    creator_id: 1,
    name: 'Tech, AI & Startups',
    description: "Les dernières tendances technologiques, intelligence artificielle et entrepreneuriat.",
    privacy: 'public',
    group_type: 'feed',
    base_members_count: 410,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 4,
    creator_id: 4,
    name: 'Gaming & Loisirs',
    description: 'Discussions chill, parties en ligne et partages de stream.',
    privacy: 'public',
    group_type: 'chat',
    base_members_count: 88,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// { group_id, user_id, role }
const groupMembers = [
  { group_id: 1, user_id: 1, role: 'member' },
  { group_id: 1, user_id: 2, role: 'admin' },
  { group_id: 2, user_id: 3, role: 'admin' },
  { group_id: 3, user_id: 1, role: 'admin' },
  { group_id: 3, user_id: 4, role: 'member' },
  { group_id: 4, user_id: 4, role: 'admin' },
];

const groupMessages = [
  {
    id: 1,
    group_id: 2,
    sender_id: 3,
    content: 'Bienvenue dans le salon Design ! Quels outils utilisez-vous cette semaine ?',
    sent_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 2,
    group_id: 4,
    sender_id: 4,
    content: 'Qui est dispo ce soir pour une session coop ?',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const conversations = [
  {
    id: 1,
    user1_id: 1,
    user2_id: 2,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60000 * 15).toISOString(),
  },
  {
    id: 2,
    user1_id: 1,
    user2_id: 3,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const messages = [
  {
    id: 1,
    conversation_id: 1,
    sender_id: 2,
    content: "Salut ! Tu as pu tester l'application mobile ?",
    is_read: true,
    sent_at: new Date(Date.now() - 60000 * 25).toISOString(),
  },
  {
    id: 2,
    conversation_id: 1,
    sender_id: 1,
    content: "Oui tout fonctionne, l'authentification et les posts sont prêts !",
    is_read: true,
    sent_at: new Date(Date.now() - 60000 * 20).toISOString(),
  },
  {
    id: 3,
    conversation_id: 1,
    sender_id: 2,
    content: "Super ! J'ai vu la version mobile React Native, c'est très fluide !",
    is_read: false,
    sent_at: new Date(Date.now() - 60000 * 15).toISOString(),
  },
  {
    id: 4,
    conversation_id: 2,
    sender_id: 3,
    content: "Hello ! J'ai peaufiné les contrastes pour l'écran de profil.",
    is_read: true,
    sent_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 5,
    conversation_id: 2,
    sender_id: 3,
    content: 'Les couleurs du mode sombre rendent super bien sur mobile.',
    is_read: true,
    sent_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// status: 0 = pending, 1 = accepted, 2 = declined
const friendRequests = [
  { id: 1, sender_id: 1, receiver_id: 2, status: 1, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 2, sender_id: 4, receiver_id: 1, status: 0, created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
];

const reports = [];

const sanitizeUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    bio: u.bio || '',
    profile_picture: u.profile_picture || null,
    created_at: u.created_at,
  };
};

const formatPost = (p, viewerId = 0) => {
  const author = users.find((u) => u.id === p.user_id) || { id: p.user_id, username: 'Anonyme', profile_picture: null };
  let likesCount = 0;
  postLikes.forEach((key) => {
    if (key.startsWith(`${p.id}:`)) likesCount += 1;
  });
  const commentsCount = comments.filter((c) => c.post_id === p.id).length;
  const liked = viewerId ? postLikes.has(`${p.id}:${viewerId}`) : false;
  return {
    id: p.id,
    user_id: p.user_id,
    group_id: p.group_id || null,
    content: p.content,
    image_path: p.image_path || null,
    created_at: p.created_at,
    likes_count: likesCount,
    comments_count: commentsCount,
    liked,
    is_liked: liked,
    user: {
      id: author.id,
      username: author.username,
      profile_picture: author.profile_picture || null,
    },
  };
};

const formatComment = (c) => {
  const author = users.find((u) => u.id === c.user_id) || { id: c.user_id, username: 'Anonyme', profile_picture: null };
  return {
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    user: {
      id: author.id,
      username: author.username,
      profile_picture: author.profile_picture || null,
    },
  };
};

const formatGroup = (g, viewerId = 0) => {
  const memberships = groupMembers.filter((m) => m.group_id === g.id);
  const isMember = viewerId ? memberships.some((m) => m.user_id === viewerId) : false;
  const members = memberships.slice(0, 5).map((m) => {
    const u = users.find((usr) => usr.id === m.user_id);
    return u ? { id: u.id, username: u.username, profile_picture: u.profile_picture, role: m.role } : null;
  }).filter(Boolean);

  return {
    id: g.id,
    creator_id: g.creator_id,
    name: g.name,
    description: g.description || '',
    privacy: g.privacy || 'public',
    group_type: g.group_type || 'feed',
    image: g.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
    members_count: (g.base_members_count || 0) + memberships.length,
    is_member: isMember,
    members,
    created_at: g.created_at,
  };
};

const getUserCounts = (userId) => ({
  posts_count: posts.filter((p) => p.user_id === userId).length,
  groups_count: groupMembers.filter((m) => m.user_id === userId).length,
  friends_count: friendRequests.filter((f) => f.status === 1 && (f.sender_id === userId || f.receiver_id === userId)).length,
});

const isDevFallback = (err) => {
  if (process.env.NODE_ENV === 'development') return true;
  if (!err) return false;
  return ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(err.code);
};

module.exports = {
  genId,
  users,
  posts,
  postLikes,
  comments,
  groups,
  groupMembers,
  groupMessages,
  conversations,
  messages,
  friendRequests,
  reports,
  sanitizeUser,
  formatPost,
  formatComment,
  formatGroup,
  getUserCounts,
  isDevFallback,
};
