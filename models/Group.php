<?php
class Group {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Groupes publics + groupes privés dont l'utilisateur est membre
    public function getVisibleGroups($user_id) {
        $stmt = $this->pdo->prepare("
            SELECT g.*, u.username AS creator_name,
                   (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_count,
                   gm.role AS my_role
            FROM `groups` g
            JOIN users u ON u.id = g.creator_id
            LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
            WHERE g.privacy = 'public' OR gm.id IS NOT NULL
            ORDER BY gm.id IS NULL, g.created_at DESC
        ");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll();
    }

    public function find($group_id, $user_id) {
        $stmt = $this->pdo->prepare("
            SELECT g.*, gm.role AS my_role
            FROM `groups` g
            LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
            WHERE g.id = ?
        ");
        $stmt->execute([$user_id, $group_id]);
        return $stmt->fetch();
    }

    public function create($creator_id, $name, $description, $privacy) {
        $privacy = $privacy === 'private' ? 'private' : 'public';
        $this->pdo->prepare("INSERT INTO `groups` (creator_id, name, description, privacy) VALUES (?, ?, ?, ?)")
            ->execute([$creator_id, $name, $description, $privacy]);
        $group_id = (int)$this->pdo->lastInsertId();
        $this->pdo->prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')")
            ->execute([$group_id, $creator_id]);
        return $group_id;
    }

    public function join($group_id, $user_id) {
        $group = $this->find($group_id, $user_id);
        if (!$group || $group['privacy'] !== 'public' || $group['my_role'] !== null) {
            return false;
        }
        return $this->pdo->prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)")
            ->execute([$group_id, $user_id]);
    }

    public function leave($group_id, $user_id) {
        $stmt = $this->pdo->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ? AND role <> 'admin'");
        $stmt->execute([$group_id, $user_id]);
        return $stmt->rowCount() > 0;
    }

    public function delete($group_id, $user_id) {
        $group = $this->find($group_id, $user_id);
        if (!$group || $group['my_role'] !== 'admin') {
            return false;
        }
        return $this->pdo->prepare("DELETE FROM `groups` WHERE id = ?")->execute([$group_id]);
    }

    public function countForUser($user_id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM group_members WHERE user_id = ?");
        $stmt->execute([$user_id]);
        return (int)$stmt->fetchColumn();
    }
}
