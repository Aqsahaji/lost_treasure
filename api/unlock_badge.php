<?php
/**
 * API: UNLOCK ACHIEVEMENT BADGE IN MYSQL DATABASE
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['captain_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active captain session.']);
    exit;
}

if (!empty($_SESSION['is_guest'])) {
    echo json_encode(['success' => true, 'is_guest' => true]);
    exit;
}

require_once '../db.php';

$captain_id = (int)$_SESSION['captain_id'];
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

$badge_id = trim($data['badgeId'] ?? '');

if (empty($badge_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing badge ID.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT IGNORE INTO captain_achievements (captain_id, badge_id) VALUES (?, ?)");
    $stmt->execute([$captain_id, $badge_id]);

    echo json_encode(['success' => true, 'message' => 'Achievement unlocked in database.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
