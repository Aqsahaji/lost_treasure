<?php
/**
 * LOST TREASURE: CAPTAIN LOGOUT
 */
session_start();
$_SESSION = [];
session_unset();
session_destroy();

header("Location: login.php");
exit;
