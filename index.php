<?php
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Rich Friedel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Created by Rich Friedel on 9/27/2014.
 */

// The number of rows in our grid
const GRID_ROWS = 4;
// The number of columns in our grid
const GRID_COLS = 4;
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
        echo "                Card #" . $tempCardNum . " Front\r\n";
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