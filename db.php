<?php
/**
 * LOST TREASURE: DATABASE CONNECTION & AUTO-INITIALIZER
 * Connects to MySQL and automatically creates the database and required tables if missing.
 */

$host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'lost_treasure';

try {
    // 1. Initial connection to MySQL server to ensure database exists
    $pdo_init = new PDO("mysql:host=$host;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Create database if it doesn't already exist
    $pdo_init->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // 2. Connect directly to the lost_treasure database
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 3. Auto-initialize tables
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `captains` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(100) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `title` VARCHAR(100) DEFAULT 'Buccaneer',
            `crest` VARCHAR(10) DEFAULT '☠️',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `voyage_saves` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `captain_id` INT NOT NULL UNIQUE,
            `current_node_id` VARCHAR(100) NOT NULL DEFAULT 'act1_start',
            `morale` INT NOT NULL DEFAULT 65,
            `dread` INT NOT NULL DEFAULT 15,
            `gold` INT NOT NULL DEFAULT 25,
            `inventory` TEXT NULL,
            `solved_puzzles` TEXT NULL,
            `history` TEXT NULL,
            `ending_reached` VARCHAR(100) NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`captain_id`) REFERENCES `captains`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `captain_achievements` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `captain_id` INT NOT NULL,
            `badge_id` VARCHAR(100) NOT NULL,
            `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_captain_badge` (`captain_id`, `badge_id`),
            FOREIGN KEY (`captain_id`) REFERENCES `captains`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `captain_endings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `captain_id` INT NOT NULL,
            `ending_id` VARCHAR(100) NOT NULL,
            `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_captain_ending` (`captain_id`, `ending_id`),
            FOREIGN KEY (`captain_id`) REFERENCES `captains`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

} catch (PDOException $e) {
    die("Database Connection / Setup Failed: " . htmlspecialchars($e->getMessage()));
}
