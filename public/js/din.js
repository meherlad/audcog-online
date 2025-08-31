// 
// Antephase Digits in Noise Task - De Sousa et al. Ear and Hearing. 2019
//
// This task tests digits in noise perception using an adaptive 1-up, 1-down paradigm
// 50% thresholds are calculated using a mean of the last 6 reversals (task stops after 10 reversals)
// Sentences consist of 3 digits  on a background of Speech Shaped White Noise
// Speakers talk in English with a Southern English accent
//
// Created by Meher Lad - August 2021
//

let dinNumbBox = [];
let dinNoDigits = 10;
let dinNumbProbe = ""; let dinPressList = "";
let dinClickAllow = true;

let dinExpHandler;
let dinPracticeList = [3, 6, 8];
let dinPracticeResp = [0, 0]; let dinPracIdx = 0;
let dinPracStimPlayed = false;
let dinPracticeVol = 0.02;

let dinNumbFiles = [];
let dinTrialPresses = 0; 
let dinTrialVerdict = []; let dinTrialVols = [0];
let dinStartTrialVolume = 10; let dinTrialVolume = dinStartTrialVolume;
let dinVoldBSteps = [10, 5, 2, 1];
let dinRevSteps = [2, 4, 6, 11]; // up to how many reversals to do each step
let dinProgress = 0;
const maxReversals = dinRevSteps[dinRevSteps.length - 1];
let dinRevVols = []; let dinThreshold;
let dinVolStepIdx = 0;
let dinReversals = 0;
let dinTrialRT = 0; let dinRTs = [];

// This function controls the state of the Speech-in-Noise Task
//
// 0 brings a participant to the main instructions section
// 1 to the practice instructions
// 2 to the practice trial
// 3 tp the get ready section
// 4 to the main part of the experiment
//
class dinState {
    constructor(state) {
        this.state = state;
    }
}

// All clickable buttons with numbers, during the response phase, are produced with this class
class dinChoiceBox {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.text = text;
        this.over = false;
        this.pressed = false;
        this.fillVal = 225;
    }

    show(p5instance) {
        p5instance.push();
        p5instance.fill(this.fillVal);
        p5instance.rectMode(p5instance.CENTER);
        p5instance.rect(this.x, this.y, this.width, this.height, 10);
        p5instance.fill(0);
        p5instance.textSize(30);
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.text(this.text, this.x, this.y);
        p5instance.strokeWeight(2);
        p5instance.stroke(255);
        p5instance.pop();
    }

    mouseisover(px, py) {
        if (this.pressed == false) {
            if ((Math.abs(this.x - px) < this.width/2) && (Math.abs(this.y - py) < this.height/2)) {
                this.fillVal = 200;
                this.over = true;
            } else {
                this.fillVal = 225;
                this.over = false;
            };
        };
    }

    clicked() {
        this.fillVal = 125;
        this.pressed = !this.pressed;
    }
}

// Deals with mouse being pressed in the DIN instance
var dinMousePressed = () => {
    if (audcog.din) {
        if (dinExpHandler.state == 0) {
            if (dinButtonInstruct.hovering == true) {
                dinIntroVideo.pause();
                dinExpHandler.state = 1;
                dinProgress = ((dinReversals / maxReversals) * 100)
                document.getElementById('progressBar').style.width = dinProgress.toString() + '%';
                document.getElementById('title_div').innerHTML = "Instructions";
                flashInstructAlpha = 255;
            };
        } else if (dinExpHandler.state == 1) {
            if (dinButtonPracticeInstruct.hovering == true) {
                dinExpHandler.state = 2;
                document.getElementById('title_div').innerHTML = "Practice - Sample 1";
                flashInstructAlpha = 255;
            };
        } else if (dinExpHandler.state == 3) {
            if (dinButtonReadySet.hovering) {
                date = new Date;
                timings.dinStartTime = `${ ("0" + (date.getHours())).slice(-2) }` + `${ ("0" + (date.getMinutes())).slice(-2) }`;

                setTimeout(function() {
                    dinPlayTrial();
                }, 2000);
                dinExpHandler.state = 4;
                document.getElementById('title_div').innerHTML = "Main Task";
                flashInstructAlpha = 255;

                dinTrialRT = din.millis();
            };
        } else if ((dinExpHandler.state == 2) || (dinExpHandler.state == 4)){
            for (let i = 0; i < dinNoDigits; i++) {
                if (dinNumbBox[i].over && !dinNumbBox[i].pressed && (dinTrialPresses < 3)) {
                    dinNumbBox[i].clicked();
                    setTimeout(function() {
                        dinNumbBox[i].pressed = false;
                    }, 500);
                    dinPressList = dinPressList + i.toString();
                    dinTrialPresses++;
                }
            };
            if (dinBackspace.over && dinTrialPresses > 0) {
                dinBackspace.clicked();
                setTimeout(function() {
                    dinBackspace.clicked();
                }, 500);
                dinPressList = dinPressList.slice(0, -1);
                dinTrialPresses--;
            };
            if (dinExpHandler.state == 2) {
                if (dinButtonPracticeRepeat.hovering) {
                    if (dinClickAllow) {
                        dinClickAllow = false;
                        dinButtonPracticeRepeat.hovering = false;
                        dinPracStimPlayed = true;
                        dinPlayTrial();
                        setTimeout(function() {
                            dinClickAllow = true;
                            for (var i=0; i < dinNumbBox.length; i++) {
                                dinNumbBox[i].fillVal = 225;
                                dinNumbBox[i].pressed = false;
                            };
                        }, 4000);
                    };
                };
                if (dinButtonPracticeNext.hovering) {
                    dinButtonPracticeNext.hovering = false;
                    dinPracStimPlayed = false;
                    dinEvalNumbChoices();
                    setTimeout(function() {
                        if (dinPracticeResp[0] == 1) {
                            dinPracticeResp[0] = 1;
                            document.getElementById('title_div').innerHTML = "Practice - Sample 2";
                            if (dinPracticeResp[1]) {
                                dinExpHandler.state = 3;
                                document.getElementById('title_div').innerHTML = "Ready Set";
                                flashInstructAlpha = 255;
                            };
                        } else {
                            document.getElementById('title_div').innerHTML = "Try Again";
                            setTimeout(function() {
                                document.getElementById('title_div').innerHTML = "Practice";
                            }, 1500);
                        };
                    }, 1500);
                };
            } else if (dinExpHandler.state == 4) {
                if (dinButtonAccept.hovering == true) {
                    dinButtonAccept.hovering = false;
                    if (dinClickAllow && dinTrialPresses == 3) {
                        dinClickAllow = false;

                        dinRTs.push(din.millis() - dinTrialRT);

                        dinEvalNumbChoices();
                        dinAdaptiveExpTrial(dinTrialVerdict[dinTrialVerdict.length-1]);
                        setTimeout(function() {
                            dinClickAllow = true;
                            for (var i=0; i < dinNumbBox.length; i++) {
                                dinNumbBox[i].fillVal = 225;
                                dinNumbBox[i].pressed = false;
                            };
                        }, 4000);
                        dinProgress = ((dinReversals / maxReversals) * 100)
                        document.getElementById('progressBar').style.width = dinProgress.toString() + '%';
                        if (dinReversals == maxReversals) {
                            document.getElementById('din_div').style.display = "none";
                            dinThreshold = calcThreshold(dinRevVols, 5); // For last 5 reversals

                            let date = new Date;
                            let timeprint = `${ ("0" + (date.getDate())).slice(-2) }` + `${ ("0" + (date.getMonth() + 1)).slice(-2) }` + `${ date.getFullYear() }` + `${ ("0" + (date.getHours())).slice(-2) }` + `${ ("0" + (date.getMinutes())).slice(-2) }`;
                            timings.dinFinishTime = `${ ("0" + (date.getHours())).slice(-2) }` + `${ ("0" + (date.getMinutes())).slice(-2) }`;
                            
                            taskresults.child(userID).child('din').child(timeprint).set({
                                'dinTrialdBs' : dinTrialVols,
                                'dinTrialRTs' : dinRTs
                            }).catch(err => {
                                console.log(err.message);
                            });
                            if (userID == 'debug') {
                                displayDebugResults(dinTrialVols);
                                document.getElementById('resultsChart').style.display = 'block';
                            } else {
                                allExpHandler.state += 1;
                                document.getElementById('din_div').style.display = 'none';
                                document.getElementById('controller_div').style.display = 'block';
                                audcog.din = false;
                                if (expOrder[allExpHandler.state] == 7) {
                                    chooseTask();
                                };
                            };
                        };
                    };
                };
            };
        } else if (dinExpHandler.state == 4) {

        };
    };
}

// Create the Digits-in-Noise Task p5js Instance
let dinBgNoise, dinPreDigits, dinIntroVideo;
const din_s = p => {
    // Preload Noise wav file
    p.preload = () => {
        if (audcog.din) {
            dinBgNoise = p.loadSound('static/audio/noise.wav');
            dinPreDigits = p.loadSound('static/audio/Carrier_WB.wav');
            dinIntroVideo = p.createVideo("static/videos/audcog_prevent_din.mp4");
        };
    }

    p.setup = () => {
        let canvas = p.createCanvas(900, 700);
        canvas.mousePressed(dinMousePressed);

        dinIntroVideo.size(800, 500);
        dinIntroVideo.hide();
        dinIntroVideo.volume(1);
        dinIntroVideo.play();

        dinExpHandler = new dinState(0);

        dinButtonInstruct = new Button(p.width/2, 600, 40, din);
        dinButtonPracticeInstruct = new Button(p.width/2, 600, 40, din);
        dinButtonPracticeRepeat = new Button(p.width/2 - 60, 580, 40, din);
        dinButtonReadySet = new Button(p.width/2, 600, 40, din);
        dinButtonPracticeNext = new Button(p.width/2 - 60, 580, 40, din);
        dinButtonAccept = new Button(p.width/2 - 60, 580, 40, din);

        let startX = 300; let stepX = 100;
        let startY = 150; let stepY = 100;
        let numStep = 3; let numCount = 0;

        dinNumbBox[numCount] = new dinChoiceBox(400, 450, '0');
        numCount++;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let numIdx = j + (numStep * i);
                if (numIdx < dinNoDigits) {
                    dinNumbBox[numCount] = new dinChoiceBox(startX + (stepX * j), startY + (stepY * i), (1 + numIdx).toString());
                    numCount++;
                };
            };
        };
        dinBackspace = new dinChoiceBox(500, 450, '<');
        
    }

    // The main experimental loop on the HTML Canvas. This loops at 60Hz and experimental stages are controlled by dinExpHandler
    p.draw = () => {
        if (audcog.din) {
            p.background(255);
            if (dinExpHandler.state == 0) {
                dinInstructions(din);
            } else if (dinExpHandler.state == 1) {
                dinPracticeInstructions(din);
            } else if (dinExpHandler.state == 2) {
                dinPracticeTrial(din);
            } else if (dinExpHandler.state == 3) {
                dinReadySet(din);
            } else if (dinExpHandler.state == 4) {
                dinMainExp(din);
            } else {
                
            };
        };
    }
}

// Create DIN Instance Mode
let din;
function createDIN() {
    din = new p5(din_s, 'din_div');
    document.getElementById('progressBar').style.width = dinProgress.toString() + '%';
}

function dinInstructions(p5instance) {
    let img = dinIntroVideo.get();
    din.image(img, 50, 0);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.textAlign(p5instance.CENTER);
    p5instance.text("Click below after the video", p5instance.width/2, 560);
    dinButtonInstruct.show(p5instance);
    dinButtonInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, din);
}

function dinPracticeInstructions(p5instance) {
    let s = 'In this practice session, you will have two trials\n\nPress the button to play sound\n\nChoose or guess the numbers that were said!\n\n\nThen press the button at the bottom again';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width/2, p5instance.height/2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text("Start Practice by clicking below", p5instance.width/2, 550);
    dinButtonPracticeInstruct.show(p5instance);
    dinButtonPracticeInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, din);
}

function dinPracticeTrial(p5instance) {
    p5instance.textSize(50);
    p5instance.fill(50);
    p5instance.text(dinPressList, p5instance.width/2 - 50, 50);
    for (var i = 0; i < dinNumbBox.length; i++) {
        dinNumbBox[i].show(p5instance);
        dinNumbBox[i].mouseisover(p5instance.mouseX, p5instance.mouseY);
    };
    dinBackspace.show(p5instance); dinBackspace.mouseisover(p5instance.mouseX, p5instance.mouseY);
    if (!dinPracStimPlayed && !dinPracticeResp[1]) {
        p5instance.textSize(25);
        p5instance.text('Play Numbers', p5instance.width/2 + 70, 580);
        dinButtonPracticeRepeat.show(p5instance);
        dinButtonPracticeRepeat.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else if (dinPracStimPlayed && dinTrialPresses == 3) {
        p5instance.textSize(25);
        p5instance.text('Next Trial', p5instance.width/2 + 70, 580);
        dinButtonPracticeNext.show(p5instance);
        dinButtonPracticeNext.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else {
        p5instance.textSize(30); p5instance.fill('red');
        p5instance.text('choose the 3 numbers you heard or make a guess', p5instance.width/2, 580);    
    };
    flashInstruct(flashInstructFadeRate, din);
    //flashPracticeInstruct();
}

function dinReadySet(p5instance) {
    let s = 'Now you will begin the actual task\n\nIt will take around 3 mins\n\nPress the button below to proceed';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width/2, p5instance.height/2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text('Start Main Task by clicking below', p5instance.width/2, 550);
    dinButtonReadySet.show(p5instance);
    dinButtonReadySet.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, din);
}

function dinMainExp(p5instance) {
    p5instance.textSize(50);
    p5instance.fill(50);
    p5instance.text(dinPressList, p5instance.width/2 - 50, 50);
    for (var i = 0; i < dinNumbBox.length; i++) {
        dinNumbBox[i].show(p5instance);
        dinNumbBox[i].mouseisover(p5instance.mouseX, p5instance.mouseY);
    };
    dinBackspace.show(p5instance); dinBackspace.mouseisover(p5instance.mouseX, p5instance.mouseY);
    if (dinTrialPresses == 3) {
        p5instance.fill(50);
        p5instance.textSize(25);
        p5instance.text('Accept Choice', p5instance.width/2 + 60, 580);
        dinButtonAccept.show(p5instance);
        dinButtonAccept.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    } else {
        p5instance.textSize(30); p5instance.fill('red');
        p5instance.text('choose the 3 numbers you heard or make a guess', p5instance.width/2, 580);    
    };
    flashInstruct(flashInstructFadeRate, din);
}

function dinPlayTrial() {
    document.getElementById('title_div').innerHTML = "Listen to the Digits";
    dinPreDigits.play(0, 1, 1);
    setTimeout(() => {
        if (dinPracticeResp[0] != 0) {
            //dinBgNoise.play(0, 1, vol);
        };
        let digitList = [];
        for (let i=0; i < dinNoDigits; i++) {
            digitList.push(i);
        };
        let tripleDigits = [];
        for (let i=0; i < 3; i++) {
            digitChoice = digitList.splice(Math.floor(Math.random()*digitList.length), 1)[0];
            dinNumbProbe = dinNumbProbe + digitChoice.toString();
            tripleDigits.push(digitChoice);
        };
        console.log(tripleDigits);

        // All digit *.wav files are loaded to cache before trial starts
        for (let i = 0; i < dinNoDigits; i++) {
            dinNumbFiles[i] = din.loadSound('static/audio/DTT_' + i + '.wav');
        };

        // Delay of 750ms to allow files to load
        setTimeout(() => {
            let dinMaskerArrayOrig
            // Extract Channel Buffers
            try {
                for (let i=0;i<2;i++) {
                    dinTargetArray1[i] = dinNumbFiles[tripleDigits[0]].buffer.getChannelData(i);  
                    dinTargetArray2[i] = dinNumbFiles[tripleDigits[1]].buffer.getChannelData(i);
                    dinTargetArray3[i] = dinNumbFiles[tripleDigits[2]].buffer.getChannelData(i);     
                };
                dinMaskerArrayOrig = dinBgNoise.buffer.getChannelData(0); 
            } catch(err) {
                for (let i=0;i<2;i++) {
                    dinTargetArray1[i] = dinNumbFiles[tripleDigits[0]].buffer.getChannelData(i);  
                    dinTargetArray2[i] = dinNumbFiles[tripleDigits[1]].buffer.getChannelData(i);
                    dinTargetArray3[i] = dinNumbFiles[tripleDigits[2]].buffer.getChannelData(i);     
                };
                dinMaskerArrayOrig = dinBgNoise.buffer.getChannelData(0); 
                console.log(err.message);
            }
            dinMaskerArray = [dinMaskerArrayOrig, dinMaskerArrayOrig];

            if (dinExpHandler.state == 2) {
                adjustSoundTMRdB(dinTargetArray1, 25, 2); adjustSoundTMRdB(dinTargetArray2, 25, 2); adjustSoundTMRdB(dinTargetArray3, 25, 2);
            } else {
                adjustSoundTMRdB(dinTargetArray1, dinTrialVolume, 2); adjustSoundTMRdB(dinTargetArray2, dinTrialVolume, 2); adjustSoundTMRdB(dinTargetArray3, dinTrialVolume, 2);
            };
            dinRmsCombineTMR(dinTargetArray1, dinTargetArray2, dinTargetArray3, dinMaskerArray);

            // Inserted loop to overcome Soundproof room computer issues
            while (dinRMS == 0) {
                dinRmsCombineTMR(dinTargetArray1, dinTargetArray2, dinTargetArray3, dinMaskerArray);
                console.log(dinRMS);
            };

            dinPlayStimuli();

        }, 750);

    }, 1000);
    flashInstruct(flashInstructFadeRate, din);
}

let dinTargetArray1 = [[], []]; let dinTargetArray2 = [[], []]; let dinTargetArray3 = [[], []];
let dinMaskerArray = [[], []]; let dinCombinedArray = [[], []];

// Create AudioContext for Combined Sound
let dinAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
let dinCombinedBuffer;

// Combines a Target and Masker sound by using Root Mean Squared normalising for the DIN stimuli
let dinRMS;
function dinRmsCombineTMR(targetArray1, targetArray2, targetArray3, maskerArray) {
    let start1 = 48000*0.1;
    let start2 = start1 + targetArray1[0].length + 48000*0.2;
    let start3 = start2 + targetArray2[0].length + 48000*0.2;

    dinCombinedArray = [[], []];
    for (let channel=0;channel<2;channel++) {
        for (let i=0;i<maskerArray[0].length;i++) {
            dinCombinedArray[channel][i] = 0;
        };
    };

    for (let channel=0;channel<2;channel++) {
        let a = 0; let b = 0; let c = 0;
        for (let i=0;i<maskerArray[0].length;i++){
            if ((i>=start1) && (i<(start1 + targetArray1[0].length))) {
                dinCombinedArray[channel][i] =  targetArray1[channel][a] + maskerArray[channel][i]; 
                a++;
            } else if ((i>=start2) && (i<(start2 + targetArray2[0].length))) {
                dinCombinedArray[channel][i] = targetArray2[channel][b] + maskerArray[channel][i]; 
                b++;
            } else if ((i>=start3) && (i<(start3 + targetArray3[0].length))) {
                dinCombinedArray[channel][i] = targetArray3[channel][c] + maskerArray[channel][i];
                c++;
            } else {
                dinCombinedArray[channel][i] = 0 + maskerArray[channel][i];
            };
        };
    };

    let dinCombinedArrayLong = dinCombinedArray[0].concat(dinCombinedArray[1]);

    // Obtain Standard Deviation (RMS) of Combined Array values
    for (let i=0;i<dinCombinedArrayLong.length; i++) {
        dinCombinedArrayLong[i] = Math.pow(dinCombinedArrayLong[i], 2);
    };

    dinRMS = Math.sqrt((dinCombinedArrayLong.reduce((a, b) => a + b, 0) / dinCombinedArrayLong.length) || 0);
    console.log(dinRMS);

    // Normalise Concatenated Array by RMS value
    for (let channel=0;channel<2;channel++) {
        for (let i=0;i<dinCombinedArray[channel].length; i++) {
            dinCombinedArray[channel][i] = dinCombinedArray[channel][i] / (dinRMS*5);
        };
    }

    dinCombinedArray[0] = new Float32Array(dinCombinedArray[0]);
    dinCombinedArray[1] = new Float32Array(dinCombinedArray[1]);
    dinCombinedBuffer = dinAudioCtx.createBuffer(2, dinMaskerArray[0].length, dinAudioCtx.sampleRate);

    for (let channel=0;channel<2;channel++) {
        dinCombinedBuffer.copyToChannel(dinCombinedArray[channel], channel, 0);
    };
}

// Play Adjusted DIN Stimulus
function dinPlayStimuli() {
    let source = dinAudioCtx.createBufferSource();
    source.buffer = dinCombinedBuffer;
    source.connect(dinAudioCtx.destination);
    source.start();

}

// Evaluate Responses in the Trial
function dinEvalNumbChoices() {
    if (dinTrialPresses == 3) {
        if (dinPressList == dinNumbProbe) {
            document.getElementById('title_div').innerHTML = 'Correct';
            console.log('Correct');
            // for (var i=0; i<dinPressList.length; i++) {
            //     dinNumbBox[Number(dinPressList[i])].fillVal = 'rgba(0,255,0, 0.25)';
            // };
            if (dinExpHandler.state == 4) {
                dinTrialVerdict.push(1);
            } else {
                dinPracticeResp[dinPracIdx] = 1;
                dinPracIdx++;
            };
        } else {
            document.getElementById('title_div').innerHTML = 'Wrong';
            console.log('Wrong');
            // for (var i=0; i<dinPressList.length; i++) {
            //     dinNumbBox[Number(dinPressList[i])].fillVal = 'rgba(255,0,0, 0.25)';
            // };
            if (dinExpHandler.state == 4) {
                dinTrialVerdict.push(0);
            };
        };
    } else {
        document.getElementById('title_div').innerHTML = 'Please make sure you choose three numbers';
        setTimeout(function() {
            document.getElementById('title_div').innerHTML = "Practice";
        }, 1500);
    };
    dinPressList = ""; dinNumbProbe = "";
    dinTrialPresses = 0;
}

function dinAdaptiveExpTrial(result) {
    // Main function to adapt the sentence (signal) to babble (target) volume ratio
    if (dinTrialVerdict.length > 1 && (dinTrialVerdict[dinTrialVerdict.length - 2] != dinTrialVerdict[dinTrialVerdict.length - 1])) {
        dinReversals += 1;
        dinRevVols.push(dinTrialVolume);
        console.log('Reversal detected');
    };
    if (dinReversals < maxReversals) {
        for (let i = 0; i< dinRevSteps.length; i++) {
            if (dinReversals <= dinRevSteps[i]){
                if (result == 1) {
                    dinTrialVolume -= dinVoldBSteps[i]; 
                } else {
                    dinTrialVolume += dinVoldBSteps[i];
                };
                dinTrialVols.push(dinTrialVolume - dinStartTrialVolume);
                break
            };          
        };    

        console.log('The volume is set at ' + (dinTrialVolume - dinStartTrialVolume));
        setTimeout(function () {
            dinPlayTrial(dinTrialVolume);
        }, 3000);
    } else {
        dinExpHandler.state = 5;
    };
}
