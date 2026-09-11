<?php
/**
 * LOST TREASURE: STANDALONE CAPTAIN REGISTRATION PAGE
 */
session_start();
require_once 'db.php';

$error_msg = '';
$success_msg = '';

// If already logged in, redirect to index
if (isset($_SESSION['captain_id'])) {
    header("Location: index.php");
    exit;
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $title = trim($_POST['title'] ?? 'Buccaneer');
    $crest = trim($_POST['crest'] ?? '☠️');

    if (empty($username) || strlen($username) < 2) {
        $error_msg = 'Captain name must be at least 2 characters long.';
    } elseif (empty($password) || strlen($password) < 4) {
        $error_msg = 'Secret mark (password) must be at least 4 characters.';
    } else {
        // Check if captain name is already taken
        $stmt = $pdo->prepare("SELECT id FROM captains WHERE LOWER(username) = LOWER(?)");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $error_msg = 'A captain by this name has already sailed these waters! Please choose another or Log In.';
        } else {
            // Hash password and insert captain
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $insert_stmt = $pdo->prepare("INSERT INTO captains (username, password_hash, title, crest) VALUES (?, ?, ?, ?)");
            $insert_stmt->execute([$username, $password_hash, $title, $crest]);
            $captain_id = $pdo->lastInsertId();

            // Create initial voyage save state in database
            $initial_inventory = json_encode(['waterlogged_journal']);
            $initial_history = json_encode(['act1_start']);
            $save_stmt = $pdo->prepare("
                INSERT INTO voyage_saves (captain_id, current_node_id, morale, dread, gold, inventory, solved_puzzles, history)
                VALUES (?, 'act1_start', 65, 15, 25, ?, '[]', ?)
            ");
            $save_stmt->execute([$captain_id, $initial_inventory, $initial_history]);

            // Set session variables
            $_SESSION['captain_id'] = $captain_id;
            $_SESSION['captain_name'] = $username;
            $_SESSION['captain_title'] = $title;
            $_SESSION['captain_crest'] = $crest;
            $_SESSION['is_guest'] = false;

            header("Location: index.php");
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign the Ship's Articles | Lost Treasure</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☠️</text></svg>">
</head>
<body class="auth-page-body">

  <div class="sea-atmosphere-layer"></div>
  <div class="ambient-fog"></div>

  <div class="auth-standalone-wrapper">
    <div class="auth-brand-header">
      <div class="ship-crest-icon">☠️</div>
      <h1>LOST TREASURE</h1>
      <span class="subtitle">The Isle of Serpents • Captain's Registry</span>
    </div>

    <div class="parchment-modal-box auth-standalone-card">
      <div class="modal-title-header">
        <h2>Sign the Ship’s Articles</h2>
        <p>Swear your oath, choose your colors, and bind your fate to the sea</p>
      </div>

      <?php if (!empty($error_msg)): ?>
        <div class="auth-alert-banner error">
          <span>⚠️</span> <?= htmlspecialchars($error_msg) ?>
        </div>
      <?php endif; ?>

      <form action="register.php" method="POST" class="auth-form-cluster">
        
        <div class="auth-input-group">
          <label for="regUsername">Captain's Name</label>
          <input type="text" name="username" id="regUsername" class="auth-parchment-input" 
                 placeholder="e.g. Captain Edward Thatch" required autofocus
                 value="<?= isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '' ?>">
        </div>

        <div class="auth-input-group">
          <label for="regPassword">Secret Mark (Password)</label>
          <input type="password" name="password" id="regPassword" class="auth-parchment-input" 
                 placeholder="Enter at least 4 characters" required>
        </div>

        <div class="auth-input-group">
          <label for="regTitle">Mariner Rank & Title</label>
          <select name="title" id="regTitle" class="auth-parchment-input">
            <option value="Buccaneer" selected>Buccaneer</option>
            <option value="Dread Corsair">Dread Corsair</option>
            <option value="Royal Privateer">Royal Privateer</option>
            <option value="Sea Scholar">Sea Scholar</option>
          </select>
        </div>

        <div class="auth-input-group">
          <label>Ship's Crest</label>
          <div class="crest-picker-grid">
            <div class="crest-option selected" data-crest="☠️">☠️</div>
            <div class="crest-option" data-crest="⚓">⚓</div>
            <div class="crest-option" data-crest="🗡️">🗡️</div>
            <div class="crest-option" data-crest="🧭">🧭</div>
            <div class="crest-option" data-crest="🌊">🌊</div>
          </div>
          <input type="hidden" name="crest" id="crestInputVal" value="☠️">
        </div>

        <button type="submit" class="auth-submit-btn">
          ⚔️ Sign the Blood Articles
        </button>

      </form>

      <div class="auth-page-footer-links">
        <p>Already signed the articles? <a href="login.php">Log in to the Captain's Helm</a></p>
        <div style="margin-top: 8px;">
          <a href="login.php?guest=1" class="guest-link-btn">⚓ Or sail as The Nameless Mariner (Guest Voyage)</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.querySelectorAll('.crest-option').forEach(crest => {
      crest.addEventListener('click', () => {
        document.querySelectorAll('.crest-option').forEach(c => c.classList.remove('selected'));
        crest.classList.add('selected');
        document.getElementById('crestInputVal').value = crest.getAttribute('data-crest');
      });
    });
  </script>

</body>
</html>
