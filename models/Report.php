<?php
class Report {
    private $db;
    
    public function __construct(PDO $db) {
        $this->db = $db;
    }
    
    public function createReport(int $reporterId, string $targetType, int $targetId, string $reason, ?string $details = null): bool {
        $stmt = $this->db->prepare("INSERT INTO reports (reporter_id, target_type, target_id, reason, details) 
                                  VALUES (:reporter_id, :target_type, :target_id, :reason, :details)");
        return $stmt->execute([
            'reporter_id' => $reporterId,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $reason,
            'details' => $details
        ]);
    }
    
    public function getReports(int $limit = 50): array {
        $stmt = $this->db->prepare("SELECT r.*, u.username as reporter_name 
                                  FROM reports r
                                  JOIN users u ON r.reporter_id = u.id
                                  ORDER BY r.created_at DESC LIMIT :limit");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function blockUser(int $blockerId, int $blockedId): bool {
        try {
            $stmt = $this->db->prepare("INSERT INTO blocks (blocker_id, blocked_id) VALUES (:blocker_id, :blocked_id)");
            return $stmt->execute([
                'blocker_id' => $blockerId,
                'blocked_id' => $blockedId
            ]);
        } catch (PDOException $e) {
            error_log("Block user error: " . $e->getMessage());
            return false;
        }
    }
}