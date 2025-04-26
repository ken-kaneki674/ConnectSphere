<?php
declare(strict_types=1);

class Group {
    private const MAX_NAME_LENGTH = 100;
    private const MAX_DESC_LENGTH = 500;
    private const ALLOWED_TYPES = ['publication', 'discussion'];
    private const ALLOWED_ROLES = ['member', 'admin', 'moderator'];
    
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create(
        string $name,
    string $description,
    int $creatorId,  // Type strict int
    string $type,
    bool $isPrivate = false,
    ?string $coverImage = null
): int {
    // Validation des entrées
    $creatorId = (int)$creatorId; // Conversion forcée en int pour sécurité
    if ($creatorId <= 0) {
        throw new InvalidArgumentException("ID créateur invalide");
    }
        $this->validateInput($name, $description, $type);
        
        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("
                INSERT INTO groups 
                (name, description, creator_id, group_type, is_private, cover_image, created_at) 
                VALUES (:name, :desc, :creator, :type, :private, :cover, NOW())
            ");
            
            $stmt->execute([
                ':name'    => $this->sanitize($name),
                ':desc'    => $this->sanitize($description),
                ':creator' => $creatorId,
                ':type'    => $type,
                ':private' => $isPrivate ? 1 : 0,
                ':cover'   => $coverImage
            ]);
            
            $groupId = (int)$this->db->lastInsertId();
            $this->addMember($groupId, $creatorId, 'admin');
            
            $this->db->commit();
            return $groupId;
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw new RuntimeException("Group creation failed: " . $e->getMessage());
        }
    }

    public function getById(int $groupId): array {
        $stmt = $this->db->prepare("
            SELECT g.*, 
                   COUNT(gm.user_id) as member_count,
                   u.username as creator_name
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            JOIN users u ON g.creator_id = u.id
            WHERE g.id = ?
            GROUP BY g.id
        ");
        
        $stmt->execute([$groupId]);
        $group = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$group) {
            throw new RuntimeException("Group not found");
        }
        
        return $group;
    }

    public function getUserGroups(int $userId, bool $includePrivate = false): array {
        $sql = "
            SELECT g.*, gm.role 
            FROM groups g 
            JOIN group_members gm ON g.id = gm.group_id 
            WHERE gm.user_id = :user_id
        ";
        
        if (!$includePrivate) {
            $sql .= " AND g.is_private = false";
        }
        
        $sql .= " ORDER BY g.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function search(string $query, ?string $type = null, int $limit = 20): array {
        $sql = "
            SELECT g.*, 
                   COUNT(gm.user_id) as member_count
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            WHERE g.name LIKE :query 
            AND g.is_private = false
        ";
        
        $params = [':query' => '%' . $this->sanitize($query) . '%'];
        
        if ($type) {
            $sql .= " AND g.group_type = :type";
            $params[':type'] = $type;
        }
        
        $sql .= " GROUP BY g.id ORDER BY member_count DESC LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_merge($params, [':limit' => $limit]));
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function addMember(int $groupId, int $userId, string $role = 'member'): bool {
        $this->validateRole($role);
        
        $stmt = $this->db->prepare("
            INSERT INTO group_members (group_id, user_id, role, joined_at) 
            VALUES (:group, :user, :role, NOW())
            ON DUPLICATE KEY UPDATE role = VALUES(role)
        ");
        
        return $stmt->execute([
            ':group' => $groupId,
            ':user'  => $userId,
            ':role'  => $role
        ]);
    }

    /**
 * Supprime un groupe et ses relations
 */
public function delete(int $groupId): bool {
    try {
        $this->db->beginTransaction();
        
        // 1. Supprimer les membres du groupe
        $stmt = $this->db->prepare("DELETE FROM group_members WHERE group_id = ?");
        $stmt->execute([$groupId]);
        
        // 2. Supprimer les messages du groupe (si applicable)
        if (method_exists($this, 'deleteGroupMessages')) {
            $this->deleteGroupMessages($groupId);
        }
        
        // 3. Supprimer le groupe lui-même
        $stmt = $this->db->prepare("DELETE FROM groups WHERE id = ?");
        $stmt->execute([$groupId]);
        
        $this->db->commit();
        return true;
        
    } catch (PDOException $e) {
        $this->db->rollBack();
        error_log("Erreur suppression groupe: " . $e->getMessage());
        throw new RuntimeException("Erreur lors de la suppression du groupe");
    }
}

/**
 * Supprime tous les messages d'un groupe (optionnel)
 */
private function deleteGroupMessages(int $groupId): void {
    $stmt = $this->db->prepare("DELETE FROM group_messages WHERE group_id = ?");
    $stmt->execute([$groupId]);
}

    public function update(int $groupId, array $data): bool {
        $this->validateInput($data['name'] ?? '', $data['description'] ?? '', $data['type'] ?? '');
        
        $sql = "UPDATE groups SET ";
        $updates = [];
        $params = [':id' => $groupId];
        
        foreach (['name', 'description', 'group_type', 'is_private', 'cover_image'] as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $field === 'is_private' ? (int)$data[$field] : $data[$field];
            }
        }
        
        if (empty($updates)) {
            return false;
        }
        
        $sql .= implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // === Private Methods ===
    
    private function validateInput(string $name, string $description, string $type): void {
        if (strlen($name) < 3 || strlen($name) > self::MAX_NAME_LENGTH) {
            throw new InvalidArgumentException("Group name must be 3-" . self::MAX_NAME_LENGTH . " characters");
        }
        
        if (strlen($description) > self::MAX_DESC_LENGTH) {
            throw new InvalidArgumentException("Description too long (max " . self::MAX_DESC_LENGTH . " chars)");
        }
        
        if (!in_array($type, self::ALLOWED_TYPES)) {
            throw new InvalidArgumentException("Invalid group type");
        }
    }
    
    private function validateRole(string $role): void {
        if (!in_array($role, self::ALLOWED_ROLES)) {
            throw new InvalidArgumentException("Invalid role specified");
        }
    }
    
    private function sanitize(string $input): string {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    public function getFilteredGroups($userId, $search, $filter, $type, $page, $perPage) {
        $offset = ($page - 1) * $perPage;
        $sql = "SELECT g.*, 
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
                (SELECT role FROM group_members WHERE group_id = g.id AND user_id = ?) as user_role
                FROM groups g
                WHERE 1=1";
        
        $params = [$userId];
        
        // Filtres
        if (!empty($search)) {
            $sql .= " AND (g.name LIKE ? OR g.description LIKE ?)";
            array_push($params, "%$search%", "%$search%");
        }
        
        if ($type) {
            $sql .= " AND g.type = ?";
            $params[] = $type;
        }
        
        switch ($filter) {
            case 'my':
                $sql .= " AND (g.creator_id = ? OR EXISTS (
                    SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?
                ))";
                array_push($params, $userId, $userId);
                break;
            case 'popular':
                $sql .= " ORDER BY member_count DESC";
                break;
            default:
                $sql .= " ORDER BY g.created_at DESC";
        }
        
        $sql .= " LIMIT ? OFFSET ?";
        array_push($params, $perPage, $offset);
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}