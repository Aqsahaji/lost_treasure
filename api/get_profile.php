<?php
/**
 * API: GET CAPTAIN PROFILE & CHRONICLES
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['captain_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active captain session.']);
    exit;
}

if (!empty($_SESSION['is_guest'])) {
    echo json_encode([
        'success' => true,
        'is_guest' => true,
        'captain' => [
            'name' => 'The Nameless Mariner',
            'title' => 'Drifter of the Seas',
            'crest' => '🧭'
        ],
        'achievements' => [],
        'endings' => []
    ]);
    exit;
}

require_once '../db.php';

$captain_id = (int)$_SESSION['captain_id'];

try {
    $stmt = $pdo->prepare("SELECT id, username, title, crest, created_at FROM captains WHERE id = ?");
    $stmt->execute([$captain_id]);
    $captain = $stmt->fetch();

    $achieve_stmt = $pdo->prepare("SELECT badge_id, unlocked_at FROM captain_achievements WHERE captain_id = ?");
    $achieve_stmt->execute([$captain_id]);
    $badges = $achieve_stmt->fetchAll();

    $endings_stmt = $pdo->prepare("SELECT ending_id, unlocked_at FROM captain_endings WHERE captain_id = ?");
    $endings_stmt->execute([$captain_id]);
    $endings = $endings_stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'is_guest' => false,
        'captain' => $captain,
        'achievements' => $badges,
        'endings' => $endings
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
