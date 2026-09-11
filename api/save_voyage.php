<?php
/**
 * API: SAVE VOYAGE STATE TO MYSQL DATABASE
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['captain_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active captain session.']);
    exit;
}

if (!empty($_SESSION['is_guest'])) {
    // Guest sessions use client-side storage
    echo json_encode(['success' => true, 'is_guest' => true]);
    exit;
}

require_once '../db.php';

$captain_id = (int)$_SESSION['captain_id'];
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
    exit;
}

$current_node_id = $data['currentNodeId'] ?? 'act1_start';
$morale = isset($data['morale']) ? (int)$data['morale'] : 65;
$dread = isset($data['dread']) ? (int)$data['dread'] : 15;
$gold = isset($data['gold']) ? (int)$data['gold'] : 25;
$inventory = json_encode($data['inventory'] ?? ['waterlogged_journal']);
$solved_puzzles = json_encode($data['solvedPuzzles'] ?? []);
$history = json_encode($data['history'] ?? ['act1_start']);
$ending_reached = !empty($data['endingReached']) ? $data['endingReached'] : null;

try {
    $stmt = $pdo->prepare("
        INSERT INTO voyage_saves 
          (captain_id, current_node_id, morale, dread, gold, inventory, solved_puzzles, history, ending_reached)
        VALUES 
          (:captain_id, :current_node_id, :morale, :dread, :gold, :inventory, :solved_puzzles, :history, :ending_reached)
        ON DUPLICATE KEY UPDATE
          current_node_id = VALUES(current_node_id),
          morale = VALUES(morale),
          dread = VALUES(dread),
          gold = VALUES(gold),
          inventory = VALUES(inventory),
          solved_puzzles = VALUES(solved_puzzles),
          history = VALUES(history),
          ending_reached = VALUES(ending_reached)
    ");

    $stmt->execute([
        ':captain_id' => $captain_id,
        ':current_node_id' => $current_node_id,
        ':morale' => $morale,
        ':dread' => $dread,
        ':gold' => $gold,
        ':inventory' => $inventory,
        ':solved_puzzles' => $solved_puzzles,
        ':history' => $history,
        ':ending_reached' => $ending_reached
    ]);

    // If an ending was reached, record in captain_endings
    if ($ending_reached) {
        $ending_stmt = $pdo->prepare("INSERT IGNORE INTO captain_endings (captain_id, ending_id) VALUES (?, ?)");
        $ending_stmt->execute([$captain_id, $ending_reached]);
    }

    echo json_encode(['success' => true, 'message' => 'Voyage saved to database successfully.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
