<?php
/*!
 * Sight Words Match Game
 * https://github.com/rf3Studios/memgame-sight-words
 *
 * Copyright 2014 Rich Friedel
 * Released under the MIT license
 */

// The number of rows in our grid
const GRID_ROWS = 4;
// The number of columns in our grid
const GRID_COLS = 4;
// Version
const VERSION_CODE = "0.0.3";
?>
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/style.css"/>
    <script src="http://code.jquery.com/jquery-2.1.1.min.js" type="application/javascript"></script>
    <script src="js/game.js" type="application/javascript"></script>

    <title>rf3studios Sight Word Match Game</title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="description" content="Sight Words Match Game For Kindergarten">
    <meta name="author" content="Rich Friedel">
</head>
<body>
<div id="container">
<div class="header">Match The Sight Words</div>
<?php
// The number of total cards we'll need for the grid
$numberOfCards = GRID_ROWS * GRID_COLS;

// Temp card count
$tempCardNum = 1;

// Generate rows
for ($i = 0; $i < (GRID_ROWS); $i++) {
    echo "<div class=\"row-wrapper\">\r\n";

    // Generate cards
    for ($j = 0; $j < GRID_COLS; $j++) {
        echo "    <div id=\"card-" . $tempCardNum . "\" class=\"flip-container\" ontouchstart=\"this.classList.toggle('hover');\">\r\n";
        echo "        <div class=\"flipper\">\r\n";
        echo "            <div class=\"front\">\r\n";
        echo "                <!-- front content -->\r\n";
        echo "            </div>\r\n";
        echo "            <div class=\"back\">\r\n";
        echo "                <!-- back content -->\r\n";
        echo "                <span class=\"card-text\"></span>\r\n";
        echo "            </div>\r\n";
        echo "        </div>\r\n";
        echo "    </div>\r\n";

        // Increment card count
        $tempCardNum++;
    }

    echo "</div>\r\n";
}
?>
</div>
<script>
    $(document).ready(function () {
        startGame();
    });
</script>
</body>
</html>