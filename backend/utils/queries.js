const pool = require('../config/database');

// Requêtes et mises en forme partagées entre les routes posts/comments/likes/users

const POST_SELECT = `
  SELECT p.id, p.user_id, p.content, p.image_path, p.created_at,
         u.username, u.profile_picture,
         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count,
         (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS comments_count,
         EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked
  FROM posts p
  JOIN users u ON p.user_id = u.id
`;

const formatPost = (row) => ({
  id: row.id,
  user_id: row.user_id,
  content: row.content,
  image_path: row.image_path,
  created_at: row.created_at,
  likes_count: Number(row.likes_count),
  comments_count: Number(row.comments_count),
  liked: Boolean(row.liked),
  user: { id: row.user_id, username: row.username, profile_picture: row.profile_picture }
});

const formatComment = (row) => ({
  id: row.id,
  post_id: row.post_id,
  user_id: row.user_id,
  content: row.content,
  created_at: row.created_at,
  user: { id: row.user_id, username: row.username, profile_picture: row.profile_picture }
});

const getPosts = async (viewerId, where = '', params = []) => {
  const [rows] = await pool.execute(
    `${POST_SELECT} ${where} ORDER BY p.created_at DESC, p.id DESC`,
    [viewerId || 0, ...params]
  );
  return rows.map(formatPost);
};

const getPost = async (viewerId, postId) => {
  const posts = await getPosts(viewerId, 'WHERE p.id = ?', [postId]);
  return posts[0] || null;
};

const getComments = async (postId) => {
  const [rows] = await pool.execute(`
    SELECT c.*, u.username, u.profile_picture
    FROM post_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC, c.id ASC
  `, [postId]);
  return rows.map(formatComment);
};

const createComment = async (postId, userId, content) => {
  const [result] = await pool.execute(
    'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  );
  const [rows] = await pool.execute(`
    SELECT c.*, u.username, u.profile_picture
    FROM post_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [result.insertId]);
  return formatComment(rows[0]);
};

const toggleLike = async (postId, userId) => {
  const [deleted] = await pool.execute(
    'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );
  const liked = deleted.affectedRows === 0;
  if (liked) {
    await pool.execute(
      'INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );
  }
  const [[{ count }]] = await pool.execute(
    'SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?',
    [postId]
  );
  return { liked, likes_count: Number(count) };
};

const getLikes = async (postId) => {
  const [likes] = await pool.execute(`
    SELECT pl.id, pl.user_id, pl.post_id, pl.created_at, u.username
    FROM post_likes pl
    JOIN users u ON pl.user_id = u.id
    WHERE pl.post_id = ?
    ORDER BY pl.created_at DESC
  `, [postId]);
  return likes;
};

const postExists = async (postId) => {
  const [rows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
  return rows.length > 0;
};

module.exports = {
  getPosts,
  getPost,
  getComments,
  createComment,
  toggleLike,
  getLikes,
  postExists
};
