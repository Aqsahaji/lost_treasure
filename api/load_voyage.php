<?php
/**
 * API: LOAD VOYAGE STATE FROM MYSQL DATABASE
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['captain_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active captain session.']);
    exit;
}

if (!empty($_SESSION['is_guest'])) {
    echo json_encode(['success' => true, 'is_guest' => true, 'savedVoyage' => null]);
    exit;
}

require_once '../db.php';

$captain_id = (int)$_SESSION['captain_id'];

try {
    // 1. Fetch voyage state
    $stmt = $pdo->prepare("SELECT * FROM voyage_saves WHERE captain_id = ? LIMIT 1");
    $stmt->execute([$captain_id]);
    $row = $stmt->fetch();

    $savedVoyage = null;
    if ($row) {
        $savedVoyage = [
            'currentNodeId' => $row['current_node_id'],
            'morale' => (int)$row['morale'],
            'dread' => (int)$row['dread'],
            'gold' => (int)$row['gold'],
            'inventory' => json_decode($row['inventory'] ?? '[]', true),
            'solvedPuzzles' => json_decode($row['solved_puzzles'] ?? '[]', true),
            'history' => json_decode($row['history'] ?? '[]', true),
            'endingReached' => $row['ending_reached'],
            'savedAt' => $row['updated_at']
        ];
    }

    // 2. Fetch unlocked achievements
    $achieve_stmt = $pdo->prepare("SELECT badge_id FROM captain_achievements WHERE captain_id = ?");
    $achieve_stmt->execute([$captain_id]);
    $badges = $achieve_stmt->fetchAll(PDO::FETCH_COLUMN);

    // 3. Fetch unlocked endings
    $endings_stmt = $pdo->prepare("SELECT ending_id FROM captain_endings WHERE captain_id = ?");
    $endings_stmt->execute([$captain_id]);
    $endings = $endings_stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'is_guest' => false,
        'captain' => [
            'id' => $captain_id,
            'name' => $_SESSION['captain_name'] ?? 'Captain',
            'title' => $_SESSION['captain_title'] ?? 'Buccaneer',
            'crest' => $_SESSION['captain_crest'] ?? '☠️'
        ],
        'savedVoyage' => $savedVoyage,
        'achievements' => $badges,
        'endings' => $endings
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
