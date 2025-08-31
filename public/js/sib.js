// 
// Speech in Babble Task - Holmes and Griffiths. Sci Reports. 2019
//
// This task tests speech in babble perception using an adaptive 1-up, 1-down paradigm
// 50% thresholds are calculated using a mean of the last 6 reversals (task stops after 10 reversals)
// Sentences consist of 5 words of the structure <NAME><VERB><NUMBER><ADJ><NOUN> on a background of 3 talkers
// Speakers talk in English with a Southern English accent
//
// Created by Meher Lad - July 2021
//

let randBabbleNumber;

let textBox = [];
let sentenceChoice = "";

let sibExpHandler;
let sampleCount = 0;

let samplePracticeList = [Math.floor(Math.random() * 144), Math.floor(Math.random() * 144) + 144];
let samplePracticeResp = [0, 0];

let sentenceList = []; let sentenceFile; let wordList = []; let preWordList = [];
let sentenceRandIdx = []; let sentenceVerdict = []; let sibTrialVols = [];
let sentenceIdx;
let sibStartTrialVolume = 20; let sibTrialVolume = sibStartTrialVolume;
let sibVolSteps = [5, 2, 1]; let sibReversals = 0; let sibRevVols = [];
let sibThreshold;
let sibRTs = []; let sibTrialRT = 0;

let sibPracStimPlayed = false;
let sibClickAllow = true;
let sibProgress = 0;
let sibTrialPresses = [0, 0, 0, 0, 0];

// This function controls the state of the Speech-in-Noise Task
//
// 0 brings a participant to the main instructions section
// 1 to the practice instructions
// 2 to the practice trial
// 3 to the main part of the experiment
//
class sibState {
    constructor(state) {
        this.state = state;
    }
}

// What happens when then mouse is pressed in the SIB instance
var sibMousePressed = () => {
    if (audcog.sib) {
        if (sibExpHandler.state == 0) {
            if (buttonInstruct.hovering == true) {
                sibExpHandler.state = 1;
                sibIntroVideo.pause();
                document.getElementById('title_div').innerHTML = "Instructions";
                flashInstructAlpha = 255;
            };
        } else if (sibExpHandler.state == 1) {
            if (buttonPracticeInstruct.hovering == true) {
                sibExpHandler.state = 2;
                document.getElementById('title_div').innerHTML = "Practice - Sample 1";
                flashInstructAlpha = 255;
            };
        } else if ((sibExpHandler.state == 2) || (sibExpHandler.state == 3) || (sibExpHandler.state == 4)) {
            var wordCount = 0;
            for (var i = 0; i < 5; i++) {
                if ((textBox[wordCount].over == true) && (textBox[wordCount].pressed != true)) {
                    textBox[wordCount].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 1].over == true) && (textBox[wordCount + 1].pressed != true)) {
                    textBox[wordCount + 1].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 1) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 2].over == true) && (textBox[wordCount + 2].pressed != true)) {
                    textBox[wordCount + 2].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 2) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 3].over == true) && (textBox[wordCount + 3].pressed != true)) {
                    textBox[wordCount + 3].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 3) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 4].over == true) && (textBox[wordCount + 4].pressed != true)) {
                    textBox[wordCount + 4].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 4) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 5].over == true) && (textBox[wordCount + 5].pressed != true)) {
                    textBox[wordCount + 5].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 5) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 6].over == true) && (textBox[wordCount + 6].pressed != true)) {
                    textBox[wordCount + 6].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 6) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 7].over == true) && (textBox[wordCount + 7].pressed != true)) {
                    textBox[wordCount + 7].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 7) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 8].over == true) && (textBox[wordCount + 8].pressed != true)) {
                    textBox[wordCount + 8].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != wordCount + 8) {
                            textBox[j].pressed = false;
                        };
                    };
                } else if ((textBox[wordCount + 9].over == true) && (textBox[wordCount + 9].pressed != true)) {
                    textBox[wordCount + 9].clicked(); sibTrialPresses[i] = 1;
                    for (var j = wordCount; j < wordCount + 10; j++) {
                        if (j != (wordCount + 9)) {
                            textBox[j].pressed = false;
                        };
                    };
                };
                wordCount = wordCount + 10;
            };
            if (sibExpHandler.state == 2) {
                if (buttonPracticeRepeat.hovering == true) {
                    if (sibClickAllow) {
                        sibClickAllow = false;
                        buttonPracticeRepeat.hovering = false;
                        playTrial(samplePracticeList[sampleCount]);
                        sibTrialPlay = true;
                        setTimeout(function () {
                            sibClickAllow = true;
                        }, 4000);
                    };
                };
                if (buttonPracticeNext.hovering == true) {
                    buttonPracticeNext.hovering = false;
                    evalWordChoices();
                    setTimeout(function () {
                        if (samplePracticeResp[sampleCount] == 1) {
                            document.getElementById('title_div').innerHTML = "Practice - Sample 2";
                            sampleCount++;
                            for (var i = 0; i < textBox.length; i++) {
                                textBox[i].fillVal = 225;
                                textBox[i].pressed = false;
                            };
                            if (sampleCount == 2) {
                                sibExpHandler.state = 3;
                                flashInstructAlpha = 255;
                            };
                        } else {
                            document.getElementById('title_div').innerHTML = "Try Again";
                            for (var i = 0; i < textBox.length; i++) {
                                textBox[i].fillVal = 225;
                                textBox[i].pressed = false;
                            };
                            setTimeout(function () {
                                document.getElementById('title_div').innerHTML = "Practice";
                            }, 1500);
                        };
                        sibTrialPlay = false;
                    }, 1500)
                };
            } else if (sibExpHandler.state == 3) {
                if (buttonReadySet.hovering == true) {
                    buttonReadySet.hovering = false;

                    date = new Date;
                    timings.sibStartTime = `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;

                    for (var i = 0; i < textBox.length; i++) {
                        textBox[i].fillVal = 225;
                        textBox[i].pressed = false;
                    };
                    sibExpHandler.state = 4;
                    document.getElementById('title_div').innerHTML = "Listen to the Sentence and Choose your Response";
                    sentenceIdx = Math.floor(Math.random() * 288);
                    setTimeout(function () {
                        playTrial(sentenceIdx);
                        sibTrialPlay = true;
                    }, 1000);
                    sentenceRandIdx.push(sentenceIdx);
                    sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
                    flashInstructAlpha = 255;

                    sibTrialRT = sib.millis();
                };
            } else if (sibExpHandler.state == 4) {
                if (buttonAccept.hovering == true) {
                    buttonAccept.hovering = false;
                    if (sibClickAllow && (sibTrialPresses.reduce((a, b) => a + b, 0) == 5)) {
                        sibClickAllow = false;
                        sibTrialPlay = false;

                        sibRTs.push(sib.millis() - sibTrialRT);

                        setTimeout(function () {
                            document.getElementById('title_div').innerHTML = "Listen to the Next Sentence and Choose your Response";
                            buttonAccept.hovering = false;
                        }, 1500);
                        evalWordChoices();
                        adaptiveExpTrial(sentenceVerdict[sentenceVerdict.length - 1]);
                        setTimeout(function () {
                            sibClickAllow = true;
                            for (var i = 0; i < textBox.length; i++) {
                                textBox[i].fillVal = 225;
                                textBox[i].pressed = false;
                            };
                        }, 4000);
                        sibProgress = ((sibReversals / 10) * 100)
                        document.getElementById('progressBar').style.width = sibProgress.toString() + '%';
                        if (sibReversals == 10) {
                            document.getElementById('sib_div').style.display = "none";
                            sibThreshold = calcThreshold(sibRevVols, 5); // For last 5 reversals

                            date = new Date;
                            timeprint = `${("0" + (date.getDate())).slice(-2)}` + `${("0" + (date.getMonth() + 1)).slice(-2)}` + `${date.getFullYear()}` + `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;
                            timings.sibFinishTime = `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;

                            taskresults.child(userID).child('sib').child(timeprint).set({
                                'sibTrialdBVols': sibTrialVols,
                                'sibTrialRTs': sibRTs
                            }).catch(err => {
                                console.log(err.message);
                            });
                            if (userID == 'debug') {
                                displayDebugResults(sibTrialVols);
                                document.getElementById('resultsChart').style.display = 'block';
                            } else {
                                allExpHandler.state += 1;
                                document.getElementById('sib_div').style.display = 'none';
                                document.getElementById('controller_div').style.display = 'block';
                                audcog.sib = false;
                                if (expOrder[allExpHandler.state] == 7) {
                                    chooseTask();
                                };
                            };
                        };
                    };
                };
            };
        } else {
            document.getElementById('title_div').innerHTML = "Results";
        };
    };
}

function evalWordChoices() {
    var pressCount = 0;
    var pressedListIdx = [];
    for (var i = 0; i < textBox.length; i++) {
        if (textBox[i].pressed) {
            pressedListIdx.push(i);
            sentenceChoice = sentenceChoice + textBox[i].text + '_';
            pressCount++;
        };
    };

    if (pressCount == 5) {
        console.log('Choice was ... ' + sentenceChoice.substring(0, sentenceChoice.length - 1));
        if (sibExpHandler.state == 2) {
            console.log('Target was ... ' + sentenceList[samplePracticeList[sampleCount]]);
            if (sentenceList[samplePracticeList[sampleCount]] == sentenceChoice.substring(0, sentenceChoice.length - 1)) {
                // for (var i=0; i<pressedListIdx.length; i++) {
                //     textBox[pressedListIdx[i]].fillVal = 'rgba(0,255,0, 0.25)';
                // };
                document.getElementById('title_div').innerHTML = 'Correct';
                console.log('Correct');
                samplePracticeResp[sampleCount] = 1;
            } else {
                // for (var i=0; i<pressedListIdx.length; i++) {
                //     textBox[pressedListIdx[i]].fillVal = 'rgba(255,0,0, 0.25)';
                // };
                document.getElementById('title_div').innerHTML = 'Wrong';
                console.log('Wrong');
            };
        } else if (sibExpHandler.state == 4) {
            console.log('Target was ... ' + sentenceList[sentenceIdx]);
            if (sentenceList[sentenceIdx] == sentenceChoice.substring(0, sentenceChoice.length - 1)) {
                // for (var i=0; i<pressedListIdx.length; i++) {
                //     textBox[pressedListIdx[i]].fillVal = 'rgba(0,255,0, 0.25)';
                // };
                document.getElementById('title_div').innerHTML = 'Correct';
                console.log('Correct');
                sentenceVerdict.push(1);
            } else {
                // for (var i=0; i<pressedListIdx.length; i++) {
                //     textBox[pressedListIdx[i]].fillVal = 'rgba(255,0,0, 0.25)';
                // };
                document.getElementById('title_div').innerHTML = 'Wrong';
                console.log('Wrong');
                sentenceVerdict.push(0);
            };
        };
    } else {
        document.getElementById('title_div').innerHTML = 'Please make sure there is a choice in every column';
        setTimeout(function () {
            document.getElementById('title_div').innerHTML = "Listen carefully to the sentence";
        }, 1500);
    };
    sentenceChoice = "";
    sibTrialPresses = [0, 0, 0, 0, 0];
}

// Create the Speech-in-Noise Task p5js Instance
let babble, csv;
let buttonInstruct, buttonReadySet, buttonAccept;
let sibIntroVideo;
const sib_s = p => {
    // Preload Babble wav file and the Text File with sentence lists to cache
    p.preload = () => {
        if (audcog.sib) {
            babble = p.loadSound('static/audio/babble3.wav');
            csv = p.loadTable('static/audio/corpus_data.csv', 'csv');
            sibIntroVideo = p.createVideo("static/videos/audcog_prevent_sib.mp4");
        };
    }

    p.setup = () => {
        let canvas = p.createCanvas(900, 700);
        canvas.mousePressed(sibMousePressed);

        sibIntroVideo.size(800, 500);
        sibIntroVideo.hide();
        sibIntroVideo.volume(1);
        sibIntroVideo.play();

        sibExpHandler = new sibState(0);

        buttonInstruct = new Button(p.width / 2, 650, 40, sib);
        buttonPracticeInstruct = new Button(p.width / 2, 650, 40, sib);
        buttonPracticeRepeat = new Button(p.width / 2 - 90, 650, 40, sib);
        buttonPracticeNext = new Button(p.width / 2 - 90, 650, 40, sib);
        buttonReadySet = new Button(p.width / 2, 650, 40, sib);
        buttonAccept = new Button(p.width / 2 - 90, 650, 40, sib);

        // All sentence wav files are loaded to cache before experiment starts
        for (let i = 0; i < csv.rows.length; i++) {
            sentenceList[i] = csv.rows[i].arr[7];
        };

        for (let j = 1; j < 6; j++) {
            let categWords = [];
            for (let k = 0; k < 10; k++) {
                categWords[k] = csv.rows[k].arr[j];
            };
            preWordList.push(categWords.sort());
        };

        for (let j = 0; j < 5; j++) {
            for (let k = 0; k < 10; k++) {
                wordList.push(preWordList[j][k]);
            };
        };

        let startX = 100; let stepX = 150;
        let startY = 50; let stepY = 60;
        let wordStep = 10;
        let wordCount = 0;

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                let wordListIdx = j + (wordStep * i);
                textBox[wordCount] = new choiceBox(startX + (stepX * i), startY + (stepY * j), wordList[wordListIdx]);
                wordCount++;
            };
        };
    }

    // The main experimental loop on the HTML Canvas. This loops at 60Hz and experimental stages are controlled by sibExpHandler
    p.draw = () => {
        if (audcog.sib) {
            p.background(255);
            if (sibExpHandler.state == 0) {
                instructions(sib);
            } else if (sibExpHandler.state == 1) {
                practiceInstructions(sib);
            } else if (sibExpHandler.state == 2) {
                practiceTrial(sib);
            } else if (sibExpHandler.state == 3) {
                readySet(sib);
            } else if (sibExpHandler.state == 4) {
                mainExp(sib);
            };
        };
    }
}

// Create SIB Instance Mode
let sib;
function createSIB() {
    sib = new p5(sib_s, 'sib_div');
    document.getElementById('progressBar').style.width = sibProgress.toString() + '%';
}

function instructions(p5instance) {
    let img = sibIntroVideo.get();
    sib.image(img, 50, 0);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.textAlign(p5instance.CENTER);
    p5instance.text("Click below after the video", p5instance.width / 2, 580);
    buttonInstruct.show(p5instance);
    buttonInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, sib);
}

function practiceInstructions(p5instance) {
    let s = 'In this practice session, you will have two trials\n\nPress the button to play sound\n\nChoose or guess the words that were said!\n\n\nThen press the button at the bottom again';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width / 2, p5instance.height / 2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text("Start Practice by clicking below", p5instance.width / 2, 580);
    buttonPracticeInstruct.show(p5instance);
    buttonPracticeInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, sib);
}

function readySet(p5instance) {
    let s = 'Now you will begin the actual task\n\nIt will take around 3 mins\n\nPress the button below to proceed';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width / 2, p5instance.height / 2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text('Start Main Task by clicking below', p5instance.width / 2, 580);
    buttonReadySet.show(p5instance);
    buttonReadySet.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, sib);
}

function flashInstruct(rate, p5instance) {
    p5instance.push();
    p5instance.fill(255, flashInstructAlpha);
    p5instance.noStroke();
    p5instance.rectMode(p5instance.CENTER);
    p5instance.rect(p5instance.width / 2, p5instance.height / 2, 900, 700);
    flashInstructAlpha -= rate;
    p5instance.pop();
}

function flashPracticeInstruct(p5instance) {
    p5instance.push();
    p5instance.fill(255, flashPracticeInstructAlpha);
    p5instance.noStroke();
    p5instance.rectMode(p5instance.CENTER);
    p5instance.rect(p5instance.width / 2, p5instance.height / 2 - 100, 900, 650);
    // flashPracticeInstructAlpha -= Math.pow(Math.E, 1/flashPracticeInstructAlpha);
    p5instance.stroke(0);
    p5instance.fill(0, 50, 200, 200);
    p5instance.triangle(265, 650, 255, 620, 275, 620);
    p5instance.triangle(450, 650, 440, 620, 460, 620);
    p5instance.triangle(650, 650, 640, 620, 660, 620);
    p5instance.pop();
}

let sibTrialPlay = false;
function practiceTrial(p5instance) {
    for (var i = 0; i < 50; i++) {
        textBox[i].show(p5instance);
        textBox[i].mouseisover(p5instance.mouseX, p5instance.mouseY);
    };
    p5instance.textSize(25);
    p5instance.fill(50);
    if (sibTrialPlay && (sibTrialPresses.reduce((a, b) => a + b, 0) == 5)) {
        p5instance.text('Next Trial', p5instance.width / 2, 650);
        buttonPracticeNext.show(p5instance);
        buttonPracticeNext.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else if (!sibTrialPlay) {
        p5instance.text('Play Sentence', p5instance.width / 2 + 20, 650);
        buttonPracticeRepeat.show(p5instance);
        buttonPracticeRepeat.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else {
        p5instance.textSize(30); p5instance.fill('red');
        p5instance.text('choose an option from each column', p5instance.width / 2, 650);
    };
    p5instance.textSize(25);
    flashInstruct(flashInstructFadeRate, sib);
    //flashPracticeInstruct();
}

function mainExp(p5instance) {
    for (var i = 0; i < 50; i++) {
        textBox[i].show(p5instance);
        textBox[i].mouseisover(p5instance.mouseX, p5instance.mouseY);
    };
    p5instance.textSize(25);
    p5instance.fill(50);
    if (sibTrialPresses.reduce((a, b) => a + b, 0) == 5) {
        p5instance.text('Accept Choice', p5instance.width / 2 + 20, 650);
        buttonAccept.show(p5instance);
        buttonAccept.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else {
        p5instance.textSize(30); p5instance.fill('red');
        p5instance.text('choose an option from each column', p5instance.width / 2, 650);
    };
    flashInstruct(flashInstructFadeRate, sib);
}

let sibSentArray = []; let sibBabbleArray = [];
function playTrial(sentenceNumber) {
    // Load the specific sentence audio file to cache before the trial starts
    sentenceFile = sib.loadSound('static/audio/' + sentenceList[sentenceNumber] + '.flac', loadedCallback, errorCallback);

    function loadedCallback() {
        // Audio is ready to be played
        sibSentArray = sentenceFile.buffer.getChannelData(0);
        sibBabbleArray = babble.buffer.getChannelData(0);

        if (sibExpHandler.state == 2) {
            adjustSoundTMRdB(sibSentArray, 40, 1);
        } else {
            adjustSoundTMRdB(sibSentArray, sibTrialVolume, 1);
        }
        sibRmsCombineTMR(sibSentArray, sibBabbleArray);

        if (sibRMS == 0) {
            sibRmsCombineTMR(sibSentArray, sibBabbleArray);
        }
        sibPlayStimuli();  // Only called once the audio is fully loaded
    }

    function errorCallback(err) {
        console.log('Error loading audio: ', err);
    }
    flashInstruct(flashInstructFadeRate, sib);
}

// Combines a Target and Masker sound by using Root Mean Squared normalising for the SIB stimuli
let sibCombinedArray = []; let sibCombinedBuffer; let maskerArrayShort;
let sibRMS;
function sibRmsCombineTMR(targetArray, maskerArray) {

    maskerArrayShort = [];
    let maskerSampleStart = Math.floor(Math.random() * 18 * 48000);
    let maskerSampleStop = maskerSampleStart + (3 * 48000);

    for (let i = maskerSampleStart; i < maskerSampleStop; i++) {
        maskerArrayShort.push(maskerArray[i]);
    };

    sibCombinedArray = [];
    for (let i = 0; i < maskerArrayShort.length; i++) {
        sibCombinedArray[i] = 0;
    };

    let a = 0;
    for (let i = 0; i < maskerArrayShort.length; i++) {
        if (i < 12000) {
            sibCombinedArray[i] = 0 + maskerArrayShort[i];
        } else if ((i >= 12000) && (i < targetArray.length)) {
            sibCombinedArray[i] = targetArray[a] + maskerArrayShort[i]; // 
            a++;
        } else {
            sibCombinedArray[i] = 0 + maskerArrayShort[i];
        };
    };

    let powArray = [];
    // Obtain Standard Deviation (RMS) of Combined Array values
    for (let i = 0; i < sibCombinedArray.length; i++) {
        powArray.push(Math.pow(sibCombinedArray[i], 2));
    };

    sibRMS = Math.sqrt((powArray.reduce((a, b) => a + b, 0) / powArray.length) || 0);
    console.log(sibRMS);

    // Normalise Concatenated Array by RMS value
    for (let i = 0; i < sibCombinedArray.length; i++) {
        sibCombinedArray[i] = sibCombinedArray[i] / (sibRMS * 4);
    };

    sibCombinedArray = new Float32Array(sibCombinedArray);

}

// Play Adjusted SIB Stimulus in Web Audio API
function sibPlayStimuli() {
    let sibAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sibCombinedBuffer = sibAudioCtx.createBuffer(1, maskerArrayShort.length, sibAudioCtx.sampleRate);
    sibCombinedBuffer.copyToChannel(sibCombinedArray, 0, 0);
    let source = sibAudioCtx.createBufferSource();
    source.buffer = sibCombinedBuffer;
    source.connect(sibAudioCtx.destination);
    source.start();

}

function adaptiveExpTrial(result) {
    for (var i = 0; i < textBox.length; i++) {
        textBox[i].fillVal = 225;
        textBox[i].pressed = false;
    };

    // Main function to adapt the sentence (signal) to babble (target) volume ratio
    if (sentenceVerdict.length > 1 && (sentenceVerdict[sentenceVerdict.length - 2] != sentenceVerdict[sentenceVerdict.length - 1])) {
        sibReversals += 1;
        sibRevVols.push(sibTrialVolume - sibStartTrialVolume);
        console.log('Reversal detected');
    };
    if (sibReversals < 10) {
        sentenceIdx = Math.floor(Math.random() * 288);
        sentenceRandIdx.push(sentenceIdx);
        if (result == 1) {
            if (sibReversals < 2) {
                sibTrialVolume -= sibVolSteps[0];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            } else if (sibReversals < 5) {
                sibTrialVolume -= sibVolSteps[1];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            } else {
                sibTrialVolume -= sibVolSteps[2];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            };
        } else {
            if (sibReversals < 2) {
                sibTrialVolume += sibVolSteps[0];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            } else if (sibReversals < 5) {
                sibTrialVolume += sibVolSteps[1];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            } else {
                sibTrialVolume += sibVolSteps[2];
                sibTrialVols.push(sibTrialVolume - sibStartTrialVolume);
            };
        };
        console.log('The volume is set at ' + (sibTrialVolume - sibStartTrialVolume));
        setTimeout(function () {
            playTrial(sentenceIdx);
        }, 2000);
    } else {
        sibExpHandler.state = 4;
    };
}