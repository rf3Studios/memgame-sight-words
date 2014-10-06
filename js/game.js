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

// General Constants
var NUMBER_OF_CARDS = 16;

// String Constants
var HEADER_TITLE = "Match The Sight Words";
var HEADER_MATCH_SUCCESS = "YAY!!! YOU FOUND A MATCH!!!";
var HEADER_MATCH_FAIL = "NO MATCH!";
var HEADER_GAME_COMPLETE = "YOU MATCHED ALL THE CARDS!!!";

// Audio Constants
var AUDIO_WELCOME = "dialog_welcome";
var AUDIO_MATCH_SUCCESS = "dialog_match_success";
var AUDIO_MATCH_FAIL = "dialog_match_fail";
var AUDIO_GAME_COMPLETE = "dialog_game_complete";

// Object that will hold the card ID and the card value
var flippedCard = {cardOneId: "", cardTwoId: "", cardOneVal: "", cardTwoVal: ""};

// Array of cards that have been matched throughout the game
var matchedCards = [];

// Flip counter
var flips = 0;

// Player score
var score = 0;

// Sight Words
var sightWords = ["a", "an", "and", "am", "are", "as", "at", "ate", "away", "be", "big", "black", "blue", "brown",
    "but", "came", "can", "come", "did", "do", "down", "eat", "eight", "find", "five", "for", "four", "get", "go",
    "good", "green", "has", "have", "he", "her", "here", "hers", "his", "him", "hum", "in", "into", "I", "is", "it",
    "like", "look", "little", "make", "me", "my", "must", "new", "nine", "no", "not", "of", "on", "one", "orange",
    "our", "out", "play", "pretty", "please", "purple", "ran", "red", "run", "said", "say", "saw", "see", "seven",
    "she", "six", "small", "so", "soon", "ten", "that", "the", "they", "them", "there", "this", "that", "three",
    "to", "too", "two", "up", "was", "we", "white", "why", "what", "who", "with", "year", "yes", "your", "yellow",
    "you", "yours"];

/**
 * Function that initializes and starts the game
 */
function startGame() {
    if ($(".flip-container").hasClass("flipped")) {
        // We are restarting the game. Clear the flipped and locked classes so that the cards flip back
        // over and are unlocked, that way the user can click them.
        $(".flip-container").removeClass("flipped locked");

        // Reset the flips counter
        flips = 0;

        // Reset the score counter
        score = 0;

        // Clear the matched cards array
        // Per this thread on StackOverflow: http://stackoverflow.com/a/1232046/520186
        // this is the fastest way of clearing the array because the array is referenced in other functions.
        while (matchedCards.length > 0) {
            matchedCards.pop();
        }
    }

    // Get eight words from the sight words array...
    var sightWordsToUse = generateSightWords();

    // Play the welcome sound
    $(playSound(AUDIO_WELCOME)).on('ended', function () {
        // Populate the cards with the generated sight words
        populateCardsWithWords(sightWordsToUse);

        // Allow the user to click the cards
        detectCardClick()
    });
}

/**
 * This is where all the work happens
 */
function detectCardClick() {
    $(".flip-container").on("click", function () {
        // Check to see if there is a processing lock on the cards
        if (isProcessingLock()) { // Locked
            return;
        }

        // Increment the flips
        flips === 2 ? flips = 1 : flips += 1;

        // Check to see which flip we are attempting
        if (flips === 1) { // First flip
            // Get card ID
            flippedCard.cardOneId = $(this).attr('id');
            // Get card value
            flippedCard.cardOneVal = $("#" + flippedCard.cardOneId).find(".card-text").text().toLowerCase();

            // Check to see if the card is locked
            if (isCardLocked(flippedCard.cardOneId)) {
                flips = 0;
                return;
            }

            // Lock the card
            lockCard(flippedCard.cardOneId);

            // Set the processing lock while audio is playing
            addProcessingLock();

            // Turn the card over
            flipCard(this);

            $(playSound(flippedCard.cardOneVal)).on("ended", function () {
                removeProcessingLock();
            });

        } else if (flips === 2) { // Second flip
            // Get card ID
            flippedCard.cardTwoId = $(this).attr('id');
            // Get card value
            flippedCard.cardTwoVal = $("#" + flippedCard.cardTwoId).find(".card-text").text().toLowerCase();

            // Check to see if card is locked
            if (isCardLocked(flippedCard.cardTwoId)) {
                // Card is locked, reset the flip counter
                flips = 1;
                // Return because there is nothing more to do
                return;
            }

            // Lock the card
            lockCard(flippedCard.cardTwoId);

            // Set the processing lock while audio is playing
            addProcessingLock();

            // Turn the second card
            flipCard(this);

            // Play the card value audio
            $(playSound(flippedCard.cardTwoVal)).on('ended', function () {
                // Check to see if we have a match
                if (flippedCard.cardOneVal === flippedCard.cardTwoVal) { // WOOHOO!!! WE FOUND A MATCH!!!
                    // Write success msg to the page alert area
                    $(".header").text(HEADER_MATCH_SUCCESS);

                    // Add the cards to the matched cards array
                    matchedCards.push(flippedCard.cardOneId, flippedCard.cardTwoId);

                    $(playSound(AUDIO_MATCH_SUCCESS)).on('ended', function () {
                        // Check to see if there are any more cards to match. If there are not, the player wins!
                        if (matchedCards.length === NUMBER_OF_CARDS) {
                            $(".header").text(HEADER_GAME_COMPLETE);
                            $(playSound(AUDIO_GAME_COMPLETE)).on("ended", function () {
                                startGame();
                            });
                        } else {
                            $(".header").text(HEADER_TITLE);
                        }
                        // Remove the processing lock on the cards
                        removeProcessingLock();
                    });
                } else {
                    $(".header").text(HEADER_MATCH_FAIL);

                    $(playSound(AUDIO_MATCH_FAIL)).on('ended', function () {
                        // Remove the lock from both cards
                        unlockCard(flippedCard.cardOneId);
                        unlockCard(flippedCard.cardTwoId);

                        // Flip both cards back over
                        flipCard("#" + flippedCard.cardOneId);
                        flipCard("#" + flippedCard.cardTwoId);

                        $(".header").text(HEADER_TITLE);

                        removeProcessingLock();
                    });
                }
            });
        }
    });
}

/// UTILITY FUNCTIONS ///

/**
 * Generates an array of 8 unique words randomly taken from the sightWords array
 *
 * @returns {Array} Returns an Array of sight words
 */
function generateSightWords() {
    var sightWordsArr = [];
    var numberOfWords = 8;
    var sightWordsArrayLen = sightWords.length - 1;
    var indexArr = [];

    // Generate 8 numbers with the lowest being 0 and the highest being the main sight words array length
    while (indexArr.length < numberOfWords) {
        var rndIndex = Math.floor((Math.random() * sightWordsArrayLen));

        // Each number need to be unique
        if ($.inArray(rndIndex, indexArr) <= -1) {
            indexArr.push(rndIndex);
        }
    }

    $.each(indexArr, function (index, value) {
        sightWordsArr.push(sightWords[value]);
    });

    return sightWordsArr;
}

/**
 * Populates the cards with the words from the passed array
 *
 * @param wordsArray {Array} An array of words that will be used to populate the cards with
 */
function populateCardsWithWords(wordsArray) {
    var a1 = wordsArray.concat(wordsArray);
    var a2 = shuffleArray(a1);

    for (var i = 1; i <= NUMBER_OF_CARDS; i++) {
        $("#card-" + i).find(".card-text").text(a2[i - 1]);
    }
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 *
 * @param arrayToShuffle {Array} The array that is to be shuffled
 * @returns {Array} Returns a randomly shuffled array
 */
function shuffleArray(arrayToShuffle) {
    for (var i = arrayToShuffle.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arrayToShuffle[i];
        arrayToShuffle[i] = arrayToShuffle[j];
        arrayToShuffle[j] = temp;
    }
    return arrayToShuffle;
}

/**
 * Plays an audio clip
 *
 * Currently, the audio clip is set to auto play.
 *
 * @param audioName {string} Name of the audio clip without the extension
 * @returns {HTMLElement} Returns the audio element
 */
function playSound(audioName) {

    var completedAudioSamples = ["a", "an", "and", "am", "are", "as", "at", "ate", "away", "be", "big", "black",
        "blue", "brown", "but", "came", "can", "come", "did", "do", "down", "eat", "eight", "dialog_welcome",
        "dialog_find_a_match", "dialog_match_success", "dialog_match_fail", "dialog_game_complete"];

    if (completedAudioSamples.indexOf(audioName) === -1) {
        audioName = "null";
    }

    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'audio/' + audioName + '.mp3');
    audioElement.setAttribute('autoplay', 'autoplay');

    return audioElement;
}

/**
 * Turns the card
 *
 * @param ele {string} Element that needs to be flipped
 */
function flipCard(ele) {
    // Flip the card and set it to flipped
    $(ele).toggleClass("flipped");
}

/**
 * Adds a processing lock to all of the cards.
 */
function addProcessingLock() {
    $(".flip-container").addClass("processing");
}

/**
 * Removes the processing lock from all of the cards.
 */
function removeProcessingLock() {
    $(".flip-container").removeClass("processing");
}

/**
 * Checks to see if there is a processing lock on any of the cards
 *
 * @returns {boolean} Returns TRUE if there is a processing lock active on the cards
 */
function isProcessingLock() {
    if ($(".flip-container").hasClass("processing")) {
        return true;
    }

    return false;
}

/**
 * Places a lock on a single card
 *
 * @param cardId {string} The ID of the card to lock
 */
function lockCard(cardId) {
    $("#" + cardId).addClass("locked");
}

/**
 * Removes a lock on a single card
 *
 * @param cardId {string} The ID of the card to unlock
 */
function unlockCard(cardId) {
    $("#" + cardId).removeClass("locked");
}

/**
 * Checks the locked state of the card
 *
 * @param cardId {string} The ID of the card that needs to be checked
 * @returns {boolean} Returns TRUE if the card is actively locked
 */
function isCardLocked(cardId) {
    if ($("#" + cardId).hasClass("locked")) {
        return true;
    }

    return false;
}