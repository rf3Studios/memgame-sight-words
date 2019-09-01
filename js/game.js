/*!
 * Sight Words Match Game
 * https://github.com/rf3Studios/memgame-sight-words
 *
 * Copyright 2014 Rich Friedel
 * Released under the MIT license
 */

// General Constants
const NUMBER_OF_CARDS = 16;

// String Constants
const HEADER_TITLE = "Match The Sight Words";
const HEADER_MATCH_SUCCESS = "YAY!!! YOU FOUND A MATCH!!!";
const HEADER_MATCH_FAIL = "NO MATCH!";
const HEADER_GAME_COMPLETE = "YOU MATCHED ALL THE CARDS!!!";

// Object that will hold the card ID and the card value
const flippedCard = {cardOneId: "", cardTwoId: "", cardOneVal: "", cardTwoVal: ""};

// Array of cards that have been matched throughout the game
const matchedCards = [];

// Flip counter
let flips = 0;

// Sight Words
const sightWords = ["a", "an", "and", "am", "are", "as", "at", "ate", "away", "be", "big", "black", "blue", "brown",
                  "but", "came", "can", "come", "did", "do", "down", "eat", "eight", "find", "five", "for", "four",
                  "get", "go", "good", "green", "has", "have", "he", "her", "here", "hers", "his", "him", "hum", "in",
                  "into", "I", "is", "it", "like", "look", "little", "make", "me", "my", "must", "new", "nine", "no",
                  "not", "of", "on", "one", "orange", "our", "out", "play", "pretty", "please", "purple", "ran", "red",
                  "run", "said", "say", "saw", "see", "seven", "she", "six", "small", "so", "soon", "ten", "that",
                  "the", "them", "they", "there", "this", "three", "to", "too", "two", "up", "was", "we", "white",
                  "why", "what", "who", "with", "year", "yes", "your", "yellow", "you", "yours", "zoo"];

// Audio Object
const audioSamples = {
    welcome: ["dialog_welcome", "dialog_begin_by_selecting_a_card", "dialog_find_a_match", "dialog_lets_play_again"],
    matchSuccess: ["dialog_good_job", "dialog_thats_a_match", "dialog_youre_awesome",
                   "dialog_wow_youre_really_good_at_this", "dialog_you_are_the_match_master", "dialog_match_tastic",
                   "dialog_you_have_some_awesome_matching_skills", "dialog_keep_it_up_youre_doing_great"],
    matchFail: ["dialog_those_dont_match", "dialog_uhoh_those_dont_match", "dialog_keep_looking_i_know_you_can_do_it",
                "dialog_try_again", "dialog_thats_not_a_match"],
    gameComplete: ["dialog_game_complete"],
    keepLooking: ["dialog_keep_looking", "dialog_can_you_find_another_match"]
};

// Create a new Score object
const theScore = new Score(0);

/**
 * Function that initializes and starts the game
 */
function startGame(flag_restart_game) {
    theScore.resetCurrentScore();
    theScore.displayCurrentScore();
    theScore.displayHighScore();

    if ($(".flip-container").hasClass("flipped")) {
        // We are restarting the game. Clear the flipped and locked classes so that the cards flip back
        // over and are unlocked, that way the user can click them.
        $(".flip-container").removeClass("flipped locked");

        // Reset the flips counter
        flips = 0;

        // Clear the matched cards array
        // Per this thread on StackOverflow: http://stackoverflow.com/a/1232046/520186
        // this is the fastest way of clearing the array because the array is referenced in other functions.
        while (matchedCards.length > 0) {
            matchedCards.pop();
        }
    }

    // Get eight words from the sight words array...
    let sightWordsToUse = generateSightWords();

    // Play the welcome sound
    if (flag_restart_game === 1) {
        $(playSound(audioSamples.welcome[2])).on("ended", function () {
            // Populate the cards with the generated sight words
            populateCardsWithWords(sightWordsToUse);

            detectCardClick()
        });
    } else {
        $(playSound(audioSamples.welcome[0])).on("ended", function () {
            // Populate the cards with the generated sight words
            populateCardsWithWords(sightWordsToUse);

            // Allow the user to click the cards
            $(playSound(audioSamples.welcome[1])).on("ended", function () {
                detectCardClick()
            });
        });
    }
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

            // Lock the card so that the card cannot be flipped back
            // over once it has been selected.
            lockCard(flippedCard.cardOneId);

            // Set the processing lock while audio is playing so that none of the cards
            // can be flipped
            addProcessingLock();

            // Turn the card over
            flipCard("#" + flippedCard.cardOneId);

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
            flipCard("#" + flippedCard.cardTwoId);

            // Increment current score
            theScore.incrementCurrentScore();
            // Display the new score
            theScore.displayCurrentScore();

            // Play the card value audio
            $(playSound(flippedCard.cardTwoVal)).on('ended', function () {
                // Check to see if we have a match
                if (flippedCard.cardOneVal === flippedCard.cardTwoVal) { // WOOHOO!!! WE FOUND A MATCH!!!
                    // Write success msg to the page alert area
                    $(".header").text(HEADER_MATCH_SUCCESS);

                    // Add the cards to the matched cards array
                    matchedCards.push(flippedCard.cardOneId, flippedCard.cardTwoId);

                    $(playSound(pickDialogAudio(audioSamples.matchSuccess))).on('ended', function () {
                        // Check to see if there are any more cards to match. If there are not, the player wins!
                        if (matchedCards.length === NUMBER_OF_CARDS) {
                            $(".header").text(HEADER_GAME_COMPLETE);
                            $(playSound(audioSamples.gameComplete[0])).on("ended", function () {
                                // Check to see if the current score is less than the stored best score
                                if (theScore.getHighScore() === 0 || theScore.getHighScore() > theScore.getCurrentScore()) {
                                    // Set the high score
                                    theScore.setHighScore(theScore.getCurrentScore());
                                    // Display the high score
                                    theScore.displayHighScore();
                                }

                                $(playSound(audioSamples.welcome[3])).on("ended", function () {
                                    // Start a new game
                                    startGame(1);
                                });
                            });
                        } else {
                            $(".header").text(HEADER_TITLE);
                        }
                        // Remove the processing lock on the cards
                        removeProcessingLock();
                    });
                } else {
                    $(".header").text(HEADER_MATCH_FAIL);

                    $(playSound(pickDialogAudio(audioSamples.matchFail))).on('ended', function () {
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
    const sightWordsArr = [];
    const numberOfWords = 8;
    const indexArr = [];

    // Generate 8 numbers with the lowest being 0 and the highest being the main sight words array length
    while (indexArr.length < numberOfWords) {
        const rndIndex = Math.floor((Math.random() * (sightWords.length - 1)));

        // Each number need to be unique
        if ($.inArray(rndIndex, indexArr) <= -1) {
            indexArr.push(rndIndex);
        }
    }

    // Push the value into the array
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
    const a1 = wordsArray.concat(wordsArray);
    const a2 = shuffleArray(a1);

    // DEBUG: Log the total array
    console.log(a2);

    for (let i = 1; i <= NUMBER_OF_CARDS; i++) {

        $("#card-" + i).find(".card-text").text(a2[i - 1]);

        // DEBUG: show which entry is in each card
        console.log("card-" + i + " :: " + a2[i - 1]);
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
    for (let i = arrayToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arrayToShuffle[i];
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
    const audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'audio/' + audioName + '.mp3');
    audioElement.setAttribute('autoplay', 'autoplay');

    return audioElement;
}

/**
 * Picks a random audio sample from an array of audio samples that are passed into the function
 * and returns the name of the audio sample
 *
 * @param {Array} audioSamples Array of the audio sample names
 * @returns {string} Name of the selected audio sample
 */
function pickDialogAudio(audioSamples) {
    const rndIndex = Math.floor((Math.random() * (audioSamples.length)));

    return audioSamples[rndIndex];
}

/**
 * Turns the card
 *
 * @param cardId {string} The card ID that needs to be flipped
 */
function flipCard(cardId) {
    // Flip the card and set it to flipped
    $(cardId).toggleClass("flipped");
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
    return $(".flip-container").hasClass("processing");
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
    return $("#" + cardId).hasClass("locked");
}

/**
 * The Score object
 *
 * @param score
 * @constructor
 */
function Score(score) {
    this.score = score;
}

/**
 * Resets the current score to 0
 */
Score.prototype.resetCurrentScore = function () {
    this.setCurrentScore(0);
};

/**
 * Resets the high score to 0
 */
Score.prototype.resetHighScore = function () {
    this.setHighScore(0);
};

/**
 * Gets the current score and returns it as a Number
 *
 * @returns {number} The current score
 */
Score.prototype.getCurrentScore = function () {
    return Number(this.score);
};

/**
 * Sets the current score to whatever is passed to it
 *
 * @param score The current score
 */
Score.prototype.setCurrentScore = function (score) {
    this.score = score;
};

/**
 * Displays the current score in the UI
 */
Score.prototype.displayCurrentScore = function () {
    $("#score-current").find(".score-nums").text(this.score);
};

/**
 * Gets the high score from the user cookie and if the cookie doesn't exist, it creates it
 *
 * @returns {number} The high score stored in the user's cookies as a Number
 */
Score.prototype.getHighScore = function () {
    if (typeof $.cookie("high_score") === 'undefined') {
        this.setHighScore(0);
    }

    return Number($.cookie("high_score"));
};

/**
 * Sets the high score in the user's cookies
 *
 * @param score The high score to set
 */
Score.prototype.setHighScore = function (score) {
    $.cookie("high_score", score, {expires: 365});
};

/**
 * Displays the user's high score in the UI
 */
Score.prototype.displayHighScore = function () {
    $("#score-best").find(".score-nums").text(this.getHighScore());
};

/**
 * Increments the current score by 1 and sets it as the current score
 */
Score.prototype.incrementCurrentScore = function () {
    this.setCurrentScore(++this.score);
};
