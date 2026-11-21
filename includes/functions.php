<?php
/**
 * ConnectSphere - Utilitaires Globaux
 */

if (!function_exists('sanitize')) {
    function sanitize($data) {
        if (is_array($data)) {
            return array_map('sanitize', $data);
        }
        return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('is_logged_in')) {
    function is_logged_in() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
}

if (!function_exists('get_current_user_id')) {
    function get_current_user_id() {
        return $_SESSION['user_id'] ?? null;
    }
}

if (!function_exists('time_ago')) {
    function time_ago($datetime) {
        $time = strtotime($datetime);
        $diff = time() - $time;
        if ($diff < 60) return "À l'instant";
        if ($diff < 3600) return floor($diff / 60) . " min";
        if ($diff < 86400) return floor($diff / 3600) . " h";
        return date('d/m/Y', $time);
    }
}
?>
