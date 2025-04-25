<?php
function getDBConnection(): PDO {
    static $db = null;
    
    if ($db === null) {
        $config = require __DIR__.'/database.php';
        
        try {
            $db = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
                $config['username'],
                $config['password'],
                $config['options']
            );
        } catch (PDOException $e) {
            throw new RuntimeException("Database connection failed: " . $e->getMessage());
        }
    }
    
    return $db;
}