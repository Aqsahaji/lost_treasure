<?php
/**
 * LOST TREASURE: STANDALONE CAPTAIN LOGIN PAGE
 */
session_start();
require_once 'db.php';

$error_msg = '';

// Check if user requested Guest Mode
if (isset($_GET['guest']) && $_GET['guest'] == '1') {
    $_SESSION['captain_id'] = 0;
    $_SESSION['captain_name'] = 'The Nameless Mariner';
    $_SESSION['captain_title'] = 'Drifter of the Seas';
    $_SESSION['captain_crest'] = '🧭';
    $_SESSION['is_guest'] = true;

    header("Location: index.php");
    exit;
}

// If already logged in, redirect to index
if (isset($_SESSION['captain_id'])) {
    header("Location: index.php");
    exit;
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error_msg = 'Please enter both Captain Name and Secret Mark.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM captains WHERE LOWER(username) = LOWER(?) LIMIT 1");
        $stmt->execute([$username]);
        $captain = $stmt->fetch();

        if ($captain && password_verify($password, $captain['password_hash'])) {
            // Valid login! Set session
            $_SESSION['captain_id'] = $captain['id'];
            $_SESSION['captain_name'] = $captain['username'];
            $_SESSION['captain_title'] = $captain['title'];
            $_SESSION['captain_crest'] = $captain['crest'];
            $_SESSION['is_guest'] = false;

            header("Location: index.php");
            exit;
        } else {
            $error_msg = 'Invalid Captain Name or Secret Mark. Check your spelling or sign the articles anew.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Captain Login | Lost Treasure</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚓</text></svg>">
</head>
<body class="auth-page-body">

  <div class="sea-atmosphere-layer"></div>
  <div class="ambient-fog"></div>

  <div class="auth-standalone-wrapper">
    <div class="auth-brand-header">
      <div class="ship-crest-icon">⚓</div>
      <h1>LOST TREASURE</h1>
      <span class="subtitle">The Isle of Serpents • Captain's Helm</span>
    </div>

    <div class="parchment-modal-box auth-standalone-card">
      <div class="modal-title-header">
        <h2>Return to the Helm</h2>
        <p>Enter your secret mark to unlock your saved voyage and chronicles</p>
      </div>

      <?php if (!empty($error_msg)): ?>
        <div class="auth-alert-banner">
          <span>⚠️</span> <?= htmlspecialchars($error_msg) ?>
        </div>
      <?php endif; ?>

      <form action="login.php" method="POST" class="auth-form-cluster">
        
        <div class="auth-input-group">
          <label for="loginUsername">Captain's Name</label>
          <input type="text" name="username" id="loginUsername" class="auth-parchment-input" 
                 placeholder="Enter registered captain name" required autofocus
                 value="<?= isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '' ?>">
        </div>

        <div class="auth-input-group">
          <label for="loginPassword">Secret Mark (Password)</label>
          <input type="password" name="password" id="loginPassword" class="auth-parchment-input" 
                 placeholder="Enter private passcode" required>
        </div>

        <button type="submit" class="auth-submit-btn">
          ⚓ Take the Helm (Login)
        </button>

      </form>

      <div class="auth-page-footer-links">
        <p>New to these treacherous waters? <a href="register.php">Sign the Ship's Articles (Register)</a></p>
        <div style="margin-top: 8px;">
          <a href="login.php?guest=1" class="guest-link-btn">⚓ Or sail as The Nameless Mariner (Guest Voyage)</a>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
