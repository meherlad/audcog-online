// Auditory Working Memory Script - Lad et al. Sci Reports. 2020
//
// Standalone Javascript Script that allows testing for precision of 1 (or 2) pure-tones held in mind over seconds
// Response is tested after a retro-cue to one of these pure-tones and measured as a location estimate on a visual analog scale
// An auditory masker comprising random tone-pips are presented during the delay phase
//
// Created by Meher Lad, September 2021
//
let flashInstructAlpha = 255; let flashPracticeInstructAlpha = 255; let flashInstructFadeRate = 5;

let awmExpHandler, sliderX, Xtransform;
let awmExpVars = {
    clickAllow: true,
    trial: 0,
    trialMatches: 0,
    trialMatchParams: [],
    trialRT: 0,
    nTrials: 32,
    progress: 0,
    pracTrials: 4,
    segCountdown: 3,
    segTrials: 16,
    pracOrder: [0, 2, 0, 2],
    pracLoad: [1, 1, 1, 1],
    pracStims1: [550, 8, 770, 16],
    pracStims2: [-1, 550, -1, 8],
    pracCues: [-1, 0, -1, 1],
    expOrder: [],
    expLoad: [],
    freqRange: [440, 880],
    expStims1: [],
    expStims2: [],
    expCues: [],
}

let awmResponseVars = {
    trialMatches: [],
    trialNoMatches: [],
    trialMatchParams: [],
    trialRTs: [],
    trialErrors: []
}

// This function controls the overall 'states' of the Auditory Working Memory Task
//
// 0 = Main instructions section
// 1 = Practice instructions
// 2 = Practice trial
// 3 = Ready Set before the Main Exp
// 4 = Main part of the experiment
// 5 = Segment Break
//
// The 'substate' determines the part of 'Practice' or 'MainExp' the participant is in
//
//  0 = Countdown
//  1 = Trial Loop
//  2 = Debrief
//
// The 'trialstate' relates to the part of the trial that the participant is in
//
//  0 = Stimulus presentation
//  1 = Retrocue if needed
//  2 = Matching Phase
//
// The 'errorstate' relates to certain errors related to the Matching part
//
//  0 = No errors
//  1 = No match with mouse prior to pressing Enter
//

class awmState {
    constructor(state) {
        this.state = state;
        this.substate = 0;
        this.trialstate = 0;
        this.errorstate = 0;
    };
}

// Create AWM Instance Mode and Experimental Conditions (Sound Parameters)
//
//  0 is Pure Tone with Load 1
//  1 is Pure Tone with Load 2
//  2 is AM Rate with Load 1
//  3 is AM Rate with Load 2
//
let awm;
function createAWM() {
    awm = new p5(awm_s, 'awm_div');
    //let trialType = 0;

    awmExpVars.progress = (((awmExpVars.trial + 1) / awmExpVars.nTrials) * 100);
    document.getElementById('progressBar').style.width = awmExpVars.progress.toString() + '%';

    for (let j = 0; j < awmExpVars.nTrials / 2; j++) {
        awmExpVars.expOrder.push(0);
        awmExpVars.expOrder.push(2);
    };

    let cueIdx = 0;
    for (let i = 0; i < awmExpVars.nTrials; i++) {
        if (awmExpVars.expOrder[i] == 0) {
            awmExpVars.expStims1.push(Math.random() * (880 - 440) + 440);
            awmExpVars.expStims2.push(-1);
            awmExpVars.expLoad.push(1);
            awmExpVars.expCues.push(-1);

        } else if (awmExpVars.expOrder[i] == 1) {
            awmExpVars.expStims1.push(Math.random() * (880 - 440) + 440);
            if (awmExpVars.expStims1[i] < 660) {
                awmExpVars.expStims2.push(Math.random() * (880 - 660) + 660);
            } else {
                awmExpVars.expStims2.push(Math.random() * (660 - 440) + 440);
            };
            awmExpVars.expLoad.push(2);
            awmExpVars.expCues.push(cues[cueIdx]);
            cueIdx++;

        } else if (awmExpVars.expOrder[i] == 2) {
            awmExpVars.expStims1.push(Math.random() * (20 - 5) + 5);
            awmExpVars.expStims2.push(-1);
            awmExpVars.expLoad.push(1);
            awmExpVars.expCues.push(-1);

        } else if (awmExpVars.expOrder[i] == 3) {
            awmExpVars.expStims1.push(Math.random() * (20 - 5) + 5);
            if (awmExpVars.expStims1[i] < 11) {
                awmExpVars.expStims2.push(Math.random() * (20 - 11) + 11);
            } else {
                awmExpVars.expStims2.push(Math.random() * (11 - 5) + 5);
            };
            awmExpVars.expLoad.push(2);
            awmExpVars.expCues.push(cues[cueIdx]);
            cueIdx++;

        };
    };
}

// Create the AWM p5js Instance
let awmIntroVideo, awmButtonReadySet, awmButtonAccept;
const awm_s = p => {
    // Preload AWM Video file
    p.preload = () => {
        awmIntroVideo = p.createVideo("static/videos/audcog_prevent_am.mp4");
    }

    // Setup p5js Canvas
    p.setup = () => {
        canvas = p.createCanvas(900, 700);
        canvas.mousePressed(awmMousePressed);

        awmIntroVideo.size(800, 500);
        awmIntroVideo.hide();
        awmIntroVideo.volume(1);
        awmIntroVideo.play();

        awmExpHandler = new awmState(0);

        awmButtonInstruct = new Button(p.width / 2, 650, 40, awm);
        awmButtonPracticeInstruct = new Button(p.width / 2, 650, 40, awm);
        awmButtonReadySet = new Button(p.width / 2, 650, 40, awm);
        awmButtonAccept = new Button(p.width / 2, 630, 100, awm);

        p.rectMode(p.CENTER);
        p.imageMode(p.CENTER);

    };

    // Draw p5js Canvas
    p.draw = () => {
        if (audcog.awm) {
            p.background(255);
            if (awmExpHandler.state == 0) {
                awmInstructions(awm);
            } else if (awmExpHandler.state == 1) {
                awmPracticeInstructions(awm);
            } else if (awmExpHandler.state == 2) {
                awmPracticeTrial(awm);
            } else if (awmExpHandler.state == 3) {
                awmReadySet(awm);
            } else if (awmExpHandler.state == 4) {
                awmMainExp(awm);
            } else {
                awmSegmentBreak(awm);
            };
        };
    };
}

// Function to be executed when mouse is pressed on AWM canvas
let awmMousePressed = () => {
    if (audcog.awm) {
        if (awmExpHandler.state == 0) {
            if (awmButtonInstruct.hovering) {
                awmIntroVideo.pause();
                awmExpHandler.state = 1;
                document.getElementById('title_div').innerHTML = "Instructions";
                flashInstructAlpha = 255;
            };
        } else if (awmExpHandler.state == 1) {
            if (awmButtonPracticeInstruct.hovering) {
                awmExpHandler.state = 2;
                document.getElementById('title_div').innerHTML = "Practice Trial";
                flashInstructAlpha = 255;
            };
        } else if (awmExpHandler.state == 2 || awmExpHandler.state == 4) {
            if (awmExpVars.clickAllow) {
                if (awmExpHandler.trialstate == 2) {
                    if (!awmButtonAccept.hovering) {
                        awmExpVars.trialMatches++;
                    };
                    awmExpVars.clickAllow = false;
                    setTimeout(function () {
                        awmExpVars.clickAllow = true;
                    }, 1010);
                    if (awmExpHandler.state == 2 && !awmButtonAccept.hovering) {
                        mouseUpdateMatch(awm, awmExpVars.pracOrder[awmExpVars.trial]);
                    } else if (awmExpHandler.state == 4 && !awmButtonAccept.hovering) {
                        mouseUpdateMatch(awm, awmExpVars.expOrder[awmExpVars.trial]);
                        awmExpVars.trialMatchParams.push(Xtransform);
                    };
                    if (awmButtonAccept.hovering) {
                        if (awmExpVars.trialMatches == 0) {
                            awmExpHandler.errorstate = 1;
                            setTimeout(function () {
                                awmExpHandler.errorstate = 0;
                            }, 1500);
                        } else {
                            if (awmExpHandler.state == 2 && awmExpHandler.trialstate == 2) {
                                awmExpVars.trialMatches = 0;
                                awmExpVars.trial++;
                                awmExpHandler.trialstate = 0;
                                if (awmExpVars.trial == awmExpVars.pracTrials) {
                                    awmExpHandler.state = 3;
                                    awmExpHandler.substate = 0;
                                    awmExpVars.trial = 0;
                                };
                                if (awmExpHandler.state == 2) {
                                    setTimeout(function () {
                                        awmPlayTrial(awmExpVars.pracOrder[awmExpVars.trial], awmExpVars.pracLoad[awmExpVars.trial], awmExpVars.pracStims1[awmExpVars.trial], awmExpVars.pracStims2[awmExpVars.trial]);
                                    }, 1500);
                                };
                            } else if (awmExpHandler.state == 4 && awmExpHandler.trialstate == 2) {
                                saveChoices();
                                awmExpVars.trial++;
                                awmExpVars.progress = (((awmExpVars.trial + 1) / awmExpVars.nTrials) * 100)
                                document.getElementById('progressBar').style.width = awmExpVars.progress.toString() + '%';
                                awmExpHandler.trialstate = 0;
                                if (awmExpVars.trial == awmExpVars.nTrials) {
                                    calcPrecision(awmExpVars.expOrder, awmExpVars.expStims1, awmExpVars.expStims2, awmExpVars.expCues, awmResponseVars.trialMatches, awmResponseVars.trialErrors);
                                    let date = new Date;
                                    let timeprint = `${("0" + (date.getDate())).slice(-2)}` + `${("0" + (date.getMonth() + 1)).slice(-2)}` + `${date.getFullYear()}` + `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;
                                    timings.awmFinishTime = `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;

                                    taskresults.child(userID).child('awm').child(timeprint).set({
                                        'trialType': awmExpVars.expOrder,
                                        'trialLoad': awmExpVars.expLoad,
                                        'reactionTimes': awmResponseVars.trialRTs,
                                        'trialNoMatches': awmResponseVars.trialNoMatches,
                                        'trialAllMatches': awmResponseVars.trialMatchParams,
                                        'trialMatches': awmResponseVars.trialMatches,
                                        'trialStim1': awmExpVars.expStims1,
                                        'trialStim2': awmExpVars.expStims2,
                                        'trialCues': awmExpVars.expCues,
                                        'awmStartTime': timings.awmStartTime,
                                        'awmFinishTime': timings.awmFinishTime
                                    }).catch(err => {
                                        console.log(err.message);
                                    });
                                    if (userID == 'debug') {
                                        calcPrecision(awmExpVars.expOrder, awmExpVars.expStims1, awmExpVars.expStims2, awmExpVars.expCues, awmResponseVars.trialMatches, awmResponseVars.trialErrors);
                                        displayDebugResults(awmResponseVars.trialErrors, 1);
                                        document.getElementById('resultsChart').style.display = 'block';
                                        document.getElementById('awm_div').style.display = 'none';
                                    } else {
                                        allExpHandler.state += 1;
                                        document.getElementById('awm_div').style.display = 'none';
                                        document.getElementById('controller_div').style.display = 'block';
                                        audcog.awm = false;
                                        if (expOrder[allExpHandler.state] == 7) {
                                            chooseTask();
                                        };
                                    };
                                } else if (awmExpVars.trial == awmExpVars.segTrials) {
                                    awmExpHandler.state = 5;
                                } else {
                                    setTimeout(function () {
                                        awmPlayTrial(awmExpVars.expOrder[awmExpVars.trial], awmExpVars.expLoad[awmExpVars.trial], awmExpVars.expStims1[awmExpVars.trial], awmExpVars.expStims2[awmExpVars.trial]);
                                    }, 1500);
                                };
                            };
                        };
                    };
                };
            };
        } else if (awmExpHandler.state == 3) {
            if (awmButtonReadySet.hovering) {
                awmExpHandler.state = 4;
                awmExpVars.segCountdown = 3;
                awmExpVars.trialMatches = 0;
                document.getElementById('title_div').innerHTML = "Get Ready";
                flashInstructAlpha = 255;
            };
        } else if (awmExpHandler.state == 5) {
            if (awmButtonReadySet.hovering) {
                awmExpHandler.state = 4;
                awmExpHandler.substate = 0;
                awmExpVars.segCountdown = 3;
                awmExpVars.trialMatches = 0;
                document.getElementById('title_div').innerHTML = "Get Ready";
                flashInstructAlpha = 255;
            };
        };
    };
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

let awmButtonInstruct, awmButtonPracticeInstruct;
function awmInstructions(p5instance) {
    awm.imageMode(awm.CENTER);
    let img = awmIntroVideo.get();
    awm.image(img, p5instance.width / 2, p5instance.height / 2);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.textAlign(p5instance.CENTER);
    p5instance.text("Click below after the video", p5instance.width / 2, 580);
    awmButtonInstruct.show(p5instance);
    awmButtonInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, awm);
}

function awmPracticeInstructions(p5instance) {
    let s = 'In this practice session, you will attempt 4 trials\n\nYou will either hear a tone or a sound like a moving train\n\nYou have to find that sound on the grey line';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width / 2, p5instance.height / 2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text("Start Practice by clicking below", p5instance.width / 2, 580);
    awmButtonPracticeInstruct.show(p5instance);
    awmButtonPracticeInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    awmFlashInstruct(flashInstructFadeRate, awm);
}

function awmFlashInstruct(rate, p5instance) {
    p5instance.push();
    p5instance.fill(255, flashInstructAlpha);
    p5instance.noStroke();
    p5instance.rectMode(p5instance.CENTER);
    p5instance.rect(p5instance.width / 2, p5instance.height / 2, 900, 700);
    flashInstructAlpha -= rate;
    p5instance.pop();
}

function awmFlashPracticeInstruct(p5instance) {
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

function awmPracticeTrial(p5instance) {
    if (awmExpHandler.substate == 0) {
        Count2Start(p5instance);
    } else if (awmExpHandler.substate == 1) {
        awmExpTrial(p5instance);
    } else if (awmExpHandler.substate == 2) {
        awmPracticeOver(p5instance);
    };
}

function awmReadySet(p5instance) {
    let s = 'Now you will begin the actual task\n\nIt will take around 3 mins\n\nTry your best to remember the sounds\n\n\nGuess when you are not sure!';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width / 2, p5instance.height / 2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text('Start Main Task by clicking below', p5instance.width / 2, 560);
    awmButtonReadySet.show(p5instance);
    awmButtonReadySet.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, awm);
}

function awmSegmentBreak(p5instance) {
    let s = 'Have a little break\n\n\n\nThen click below to continue the task';
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width / 2, p5instance.height / 2 - 50);
    p5instance.textSize(25);
    p5instance.fill(50);
    p5instance.text('Continue by clicking below', p5instance.width / 2, 560);
    awmButtonReadySet.show(p5instance);
    awmButtonReadySet.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, awm);
}

function awmMainExp(p5instance) {
    if (awmExpHandler.substate == 0) {
        Count2Start(p5instance);
    } else if (awmExpHandler.substate == 1) {
        awmExpTrial(p5instance);
    } else if (awmExpHandler.substate == 2) {
        awmTaskOver(p5instance);
    };
}

function Count2Start(p5instance) {
    if (p5instance.frameCount % 60 == 0) {
        awmExpVars.segCountdown--;
    };
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.textSize(100);
    if (awmExpVars.segCountdown == 0) {
        awmExpHandler.substate = 1;

        date = new Date;
        timings.awmStartTime = `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;

        if (awmExpHandler.state == 2) {
            setTimeout(function () {
                awmPlayTrial(awmExpVars.pracOrder[awmExpVars.trial], awmExpVars.pracLoad[awmExpVars.trial], awmExpVars.pracStims1[awmExpVars.trial], awmExpVars.pracStims2[awmExpVars.trial]);
            }, 1500);
        } else if (awmExpHandler.state == 4) {
            setTimeout(function () {
                awmPlayTrial(awmExpVars.expOrder[awmExpVars.trial], awmExpVars.expLoad[awmExpVars.trial], awmExpVars.expStims1[awmExpVars.trial], awmExpVars.expStims2[awmExpVars.trial]);
            }, 1500);
        };
    } else {
        p5instance.fill(0);
        p5instance.text(awmExpVars.segCountdown, p5instance.width / 2, p5instance.height / 2);
    };
}

// Playing the Auditory Stimulus and Probe in each trial after the trialUpdate..() functions are performed
function playSound(trialtype, param) {
    if (trialtype == 0 || trialtype == 1) {
        //Pure Tone
        let tone = new p5.Oscillator('sine');
        let env = new p5.Envelope();
        env.setADSR(0.01, 0.95, 0.1, 0.01)
        tone.amp(env);
        tone.freq(param);
        tone.start();
        env.play();
        setTimeout(function () {
            tone.stop();
        }, 1000);
    } else if (trialtype == 2 || trialtype == 3) {
        //AM Noise
        mod = new p5.Oscillator('sine');
        mod.freq(param);
        mod.disconnect();
        mod.start();
        noise = new p5.Noise('brown');
        noise.amp(mod, 0.1);
        noise.start();
        setTimeout(function () {
            mod.stop();
            noise.stop();
        }, 1000);
    };
}

// Function to Play an AWM Trial
function awmPlayTrial(trialtype, load, param1, param2) {
    if (load == 1) {
        playSound(trialtype, param1);
        setTimeout(function () {
            //audMasker(awm);
            awmExpHandler.trialstate = 2;
        }, 2000);
    } else if (load == 2) {
        playSound(trialtype, param1);
        setTimeout(function () {
            playSound(trialtype, param2);
            setTimeout(function () {
                //audMasker(awm);
                awmExpHandler.trialstate = 2;
            }, 2000);
        }, 2000);
    };
}

// This function prompts the user to Click on the slider to choose an answer before pressing Enter
function clickPrompt(p5instance) {
    p5instance.push();
    p5instance.fill(0, 150);
    p5instance.textSize(30);
    p5instance.text('LEFT-CLICK to make a CHOICE with your MOUSE', p5instance.width / 2, p5instance.height / 2 * 2 / 3);
    p5instance.pop();
}

// Updates the location of the Red Marker above the slider when the Probe is initially displayed and a Match is made
function markerUpdate(p5instance) {
    p5instance.push();
    p5instance.strokeWeight(2);
    p5instance.stroke(125, 0, 0);
    p5instance.fill('red');
    p5instance.triangle(p5instance.constrain(sliderX, 100, 900), p5instance.height / 2 - 60, sliderX - 10, p5instance.height / 2 - 75, sliderX + 10, p5instance.height / 2 - 75);
    p5instance.pop();
}

// Display the Slider on the screen as a long rectangle
function displaySlider(p5instance) {
    p5instance.push();
    p5instance.stroke(200);
    p5instance.fill(150, 50);
    p5instance.rect(p5instance.width / 2, p5instance.height / 2, 800, 20, 10, 10, 10, 10);
    p5instance.pop();
}

// Update marker on the scale during Matching Phase and play corresponding sound
function mouseUpdateMatch(p5instance, trialType) {
    sliderX = p5instance.mouseX;
    if (trialType == 0 || trialType == 1) {
        Xtransform = p5instance.map(p5instance.mouseX, 200, 800, 440, 880);
        console.log('sound parameter match is ... ' + Xtransform);
        playSound(trialType, Xtransform);
    } else if (trialType == 2 || trialType == 3) {
        Xtransform = p5instance.map(p5instance.mouseX, 200, 800, 5, 20);
        console.log('sound parameter match is ... ' + Xtransform);
        playSound(trialType, Xtransform);
        //no protect
    };
}

// Main Trial Loop - Step by Step Comments in Place
function awmExpTrial(p5instance) {
    // Trial Stimulus
    if (awmExpHandler.trialstate == 0) {
        p5instance.push();
        p5instance.fill(0, 100);
        p5instance.textSize(40);
        p5instance.text('Listen Carefully', p5instance.width / 2, p5instance.height / 2 - 40);
        p5instance.pop();
        // Matching part of trial
    } else if (awmExpHandler.trialstate == 1) {
        p5instance.push();
        p5instance.fill(0, 100);
        p5instance.textSize(40);
        if (awmExpHandler.state == 2) {
            if (awmExpVars.pracLoad[awmExpVars.trial] == 2) {
                p5instance.text('Remember sound', p5instance.width / 2, p5instance.height / 2 - 40);
                p5instance.text(awmExpVars.pracCues[awmExpVars.trial] + 1, p5instance.width / 2, p5instance.height / 2);
            };
        } else if (awmExpHandler.state = 4) {
            if (awmExpVars.expLoad[awmExpVars.trial] == 2) {
                p5instance.text('Remember sound', p5instance.width / 2, p5instance.height / 2 - 40);
                p5instance.text(awmExpVars.expCues[awmExpVars.trial] + 1, p5instance.width / 2, p5instance.height / 2);
            };
        };
        p5instance.pop();
        // Matching part of trial
    } else if (awmExpHandler.trialstate == 2) {
        awmExpVars.trialRT = p5instance.millis();
        document.body.style.cursor = 'default';
        if (awmExpVars.trialMatches != 0) {
            markerUpdate(awm);
        };
        displaySlider(awm);
        if (awmExpHandler.errorstate == 1) {
            clickPrompt(awm);
        };
        p5instance.push();
        p5instance.fill(0, 100);
        p5instance.textSize(40);
        p5instance.text('Find the SOUND on the line below with the mouse', p5instance.width / 2, p5instance.height / 5);
        p5instance.text('Press the BUTTON below for the next trial', p5instance.width / 2, p5instance.height * 3.5 / 5);
        awmButtonAccept.show(p5instance);
        awmButtonAccept.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
        p5instance.fill(10, 225);
        p5instance.rect(p5instance.constrain(p5instance.mouseX, 100, 900), p5instance.height / 2, 10, 50, 20, 20, 20, 20);
        p5instance.pop();
    };
}

// Append trial parameters and choices into the master 'exp' list
function saveChoices() {
    awmResponseVars.trialRTs.push(awm.millis() - awmExpVars.trialRT);
    awmResponseVars.trialMatches.push(Xtransform);
    awmResponseVars.trialNoMatches.push(awmExpVars.trialMatches);
    awmExpVars.trialMatches = 0;
    awmResponseVars.trialMatchParams.push(awmExpVars.trialMatchParams);
    awmExpVars.trialMatchParams = [];
}

function awmPracticeOver(p5instance) {
    if (progress.expEnd) {
        document.body.style.cursor = 'default';
        p5instance.fill(200);
        p5instance.stroke(0, 125);
        p5instance.strokeWeight(2);
        p5instance.rect(p5instance.width / 2, p5instance.height / 2 + 50, 550, 275, 50);
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.textSize(40);
        p5instance.noStroke();
        p5instance.fill(100);
        p5instance.text("Click Below for the Main Experiment", p5instance.width / 2, p5instance.height / 4);
        p5instance.textAlign(p5instance.LEFT);
        outrobutton1 = new IntroButton(p5instance.width / 3.2, p5instance.height / 2 + 40, 60);
        outrobutton1.show(awm);
        progress.hoverOption[1] = hoverbutton(outrobutton1.x, outrobutton1.y, outrobutton1.rad, progress.hoverOption[1], false);
        p5instance.textFont('Arial');
        p5instance.noStroke();
        p5instance.fill(50);
        if (!progress.hoverOption[1]) {
            p5instance.textSize(20);
            p5instance.fill(0, 100);
            p5instance.text('Click Here', p5instance.width / 2.5, p5instance.height / 2 + 40);
        } else {
            p5instance.textSize(22);
            p5instance.fill(0, 200);
            p5instance.text('Click Here', p5instance.width / 2.5, p5instance.height / 2 + 40);
        };
    };
}

function awmTaskOver(p5instance) {
    if (progress.expEnd) {
        document.body.style.cursor = 'default';
        p5instance.fill(200);
        p5instance.stroke(0, 125);
        p5instance.strokeWeight(2);
        p5instance.rect(p5instance.width / 2, p5instance.height / 2 + 50, 550, 275, 50);
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.textSize(40);
        p5instance.noStroke();
        p5instance.fill(100);
        p5instance.text("Thank you for your time!", p5instance.width / 2, p5instance.height / 4);
        p5instance.textAlign(p5instance.LEFT);
        outrobutton1 = new IntroButton(p5instance.width / 3.2, p5instance.height / 2 + 40, 60);
        outrobutton1.show(awm);
        progress.hoverOption[1] = hoverbutton(outrobutton1.x, outrobutton1.y, outrobutton1.rad, progress.hoverOption[1], false);
        p5instance.textFont('Arial');
        p5instance.noStroke();
        p5instance.fill(50);
        if (!progress.hoverOption[1]) {
            p5instance.textSize(20);
            p5instance.fill(0, 100);
            p5instance.text('Click Here', p5instance.width / 2.5, p5instance.height / 2 + 40);
        } else {
            p5instance.textSize(22);
            p5instance.fill(0, 200);
            p5instance.text('Click Here', p5instance.width / 2.5, p5instance.height / 2 + 40);
        };
    };
}

let precisionFreqLoad1, precisionFreqLoad2, precisionAMLoad1, precisionAMLoad2;
let FreqLoad1errors = [], FreqLoad2errors = [], AMLoad1errors = [], AMLoad2errors = [];
function calcPrecision(expOrder, expStims1, expStims2, expCues, trialMatches, errorsAll) {
    let error;
    for (let i = 0; i < awmExpVars.nTrials; i++) {
        if (expOrder[i] == 0) {
            error = (Math.log(expStims1[i]) - Math.log(trialMatches[i])) / Math.log(expStims1[i]);
            errorsAll.push(error * 100);
            FreqLoad1errors.push(error * 100);
        } else if (expOrder[i] == 1) {
            if (expCues[i] == 0) {
                error = (Math.log(expStims1[i]) - Math.log(trialMatches[i])) / Math.log(expStims1[i]);
            } else {
                error = (Math.log(expStims2[i]) - Math.log(trialMatches[i])) / Math.log(expStims2[i]);
            };
            errorsAll.push(error * 100);
            FreqLoad2errors.push(error * 100);
        } else if (expOrder[i] == 2) {
            error = (Math.log(expStims1[i]) - Math.log(trialMatches[i])) / Math.log(expStims1[i]);
            errorsAll.push(error * 100);
            AMLoad1errors.push(error * 100);
        } else if (expOrder[i] == 3) {
            if (expCues[i] == 0) {
                error = (Math.log(expStims1[i]) - Math.log(trialMatches[i])) / Math.log(expStims1[i]);
            } else {
                error = (Math.log(expStims2[i]) - Math.log(trialMatches[i])) / Math.log(expStims2[i]);
            };
            errorsAll.push(error * 100);
            AMLoad2errors.push(error * 100);
        };
    };

    precisionFreqLoad1 = 1 / ss.standardDeviation(FreqLoad1errors);
    //precisionFreqLoad2 = 1/ss.standardDeviation(FreqLoad2errors);
    precisionAMLoad1 = 1 / ss.standardDeviation(AMLoad1errors);
    //precisionAMLoad2 = 1/ss.standardDeviation(AMLoad2errors);
}