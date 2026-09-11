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
  <!-- Three.js 3D WebGL Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="js/three_models.js"></script>
</head>
<body class="auth-page-body" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; margin:0; padding:30px 16px; box-sizing:border-box; perspective:1200px;">

  <div class="sea-atmosphere-layer"></div>
  <div class="ambient-fog"></div>

  <div class="auth-standalone-wrapper" style="margin:auto; width:100%; max-width:520px; display:flex; flex-direction:column; align-items:center; justify-content:center; transform-style:preserve-3d;">
    <div class="auth-brand-header">
      <!-- 3D Interactive WebGL Aztec Gold Medallion Model -->
      <div id="auth3DModelCanvas" style="width: 140px; height: 140px; margin: 0 auto; cursor: grab;" title="Interactive 3D Aztec Sun Medallion (Drag to inspect)"></div>
      <h1>LOST TREASURE</h1>
      <span class="subtitle">The Isle of Serpents • Captain's Helm</span>
    </div>

    <div class="parchment-modal-box auth-standalone-card card-3d-tilt" id="loginCard">
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
        <div style="margin-top: 10px;">
          <a href="login.php?guest=1" class="guest-link-btn">⚓ Or sail as The Nameless Mariner (Guest Voyage)</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Initialize Three.js 3D Aztec Sun Medallion
    window.addEventListener('DOMContentLoaded', () => {
      if (window.lostTreasure3D) {
        window.lostTreasure3D.initHeroModel('auth3DModelCanvas', 'sun_medallion');
      }
    });

    // Interactive 3D Tilt Parallax Effect
    const card = document.getElementById('loginCard');
    if (card) {
      document.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const mouseX = e.clientX - cardCenterX;
        const mouseY = e.clientY - cardCenterY;
        
        const rotateX = -(mouseY / (window.innerHeight / 2)) * 8;
        const rotateY = (mouseX / (window.innerWidth / 2)) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
      });

      document.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'transform 0.5s ease';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
      });
    }
  </script>

</body>
</html>
