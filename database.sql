-- =========================================================================
-- LOST TREASURE: DATABASE DUMP & SCHEMA
-- Database: `lost_treasure`
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `lost_treasure` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lost_treasure`;

-- 1. Captains User Registry
CREATE TABLE IF NOT EXISTS `captains` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `title` VARCHAR(100) DEFAULT 'Buccaneer',
    `crest` VARCHAR(10) DEFAULT '☠️',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Persistent Voyage Checkpoints & Saves
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

-- 3. Captain Unlocked Achievements
CREATE TABLE IF NOT EXISTS `captain_achievements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `captain_id` INT NOT NULL,
    `badge_id` VARCHAR(100) NOT NULL,
    `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_captain_badge` (`captain_id`, `badge_id`),
    FOREIGN KEY (`captain_id`) REFERENCES `captains`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Captain Unlocked Endings
CREATE TABLE IF NOT EXISTS `captain_endings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `captain_id` INT NOT NULL,
    `ending_id` VARCHAR(100) NOT NULL,
    `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_captain_ending` (`captain_id`, `ending_id`),
    FOREIGN KEY (`captain_id`) REFERENCES `captains`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
