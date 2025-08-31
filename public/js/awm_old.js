// This script contains all the essential details for the Working Memory Task

// Initiate task variables to be used below
let matches, other_option, lab, datatype, taskRT;

// Initiate modifiable variables linking visual and auditory parameters to canvas parameters
let sliderX, Freq, AM, probeX, Xtransform, RateTransform, noise, mod;

// Experimental Variables are initialised
let exp_length = [8, 70];
let exp = {
    nTrials :           0,
    aud1_nTrials :      30,
    aud2_nTrials :      20,
    aud3_nTrials :      20,
    segmentTrials :     10,
    segmentsCompleted : 0,
    totsegments :       7,
    practiceTrials :    4,
    practiceorder :     [],     // order of practice trials
    taskorder :         [],     // order of experimental trials
    stims :             [],     // stimuli for each trial
    probes :            [],
    otheroptions :      [],     // distracter presented during probe i.e. the kind of Auditory probe presented (tone or AM sound) during a Visual trial
    otherparams :       [],     // parameter of the otheroption
    matches :           [],     // matched parameters per trial
    firstmatches :      [],     // first match parameter per trial
    matchno :           [],     // number of match attempts per trial
    matchtime :         [],     // reaction times per trial
}

// Auditory Experimental Variables
let aud = {
    freq_low :          440,
    freq_high :         880,
    am_low :            5,
    am_high :           20,
}

// Progression Markers
let progress = {
    loggedin :          false,
    begin :             true,
    practice :          false,
    prac_countdown :    false,
    ready_set :         false,
    segmentcomplete :   false,
    expEnd :            false,
    expStart :          false,
    practice_trial :    0,
    current_trial :     0,
    audPart1 :          false,
    audPart2 :          false,
    frameSound :        0,
    frameAudMask :      0,
    stimDisplay :       true,
    matchDisplay :      false,
    clickPrompt :       false,
    crosshair :         false,
    masker :            false,
    probe :             false,
    percept :           false,
    hoverOption :       [false, false, false],
    countdown :         3,
    timestamp :         0,
    iti :               0,
    maskstart :         0,
    probestart :        0,
    matchstart :        0,
    masknoisepoint :    0,
    promptstart :       0,
    noiseduration :     0,
    seeResults :        false,
    markerchoice :      false,
    userchoice :        false,
    userchoice_count :  0
}

// Auditory Results per Trial
let trialFreq = [];
let matchFreq = [];
let trialAM = [];
let matchAM = [];

// These variables collect the parameter for the probe in each trial and the parameter of distractor stimuli in the multisensory trials
let probeParam = [];

// Creates the number of trials for the experiment based on the userID
function CreateNTrials(userinput) {
    if (userinput == 'demo') {
        exp.nTrials = exp_length[0];
        exp.aud1_nTrials = 2;
        exp.aud2_nTrials = 2;
        exp.aud3_nTrials = 4;
        survey_segment = 1;
        matrix_segment = 1;
        exp.segmentTrials = 2;
    } else {
        exp.nTrials = exp_length[1];
    };
}

// Creat the Auditory Working Memory Task p5js Instance
const awm_s = p => {
    // This is the Setup function for the main p5.js canvas
    p.setup = () => {
        var canvas = p.createCanvas(1000, 500);
        canvas.mousePressed(awmMousePressed);

        p.imageMode(p.CENTER);
        p.rectMode(p.CENTER);
    }

    // The main animation loop for the Working Memory Task
    p.draw = () => {
        p.background(255);
        if (progress.begin) {
            ExpBegin(awm);
        } else if (progress.practice) {
            if (progress.prac_countdown) {
                Count2Start(awm);
            } else {
                CrossHair(awm);
                ExpTrial(awm);
                PracticeMessage(awm);
            };
        } else if (progress.ready_set) {
            ReadySet(awm);
        } else {
            if (progress.expStart) {
                Count2Start(awm);
            } else if (!progress.expStart && !progress.expEnd) {
                CrossHair(awm);
                ExpTrial(awm);
            } else if (progress.expEnd) {
                TaskOver(awm);
            };
        };
    };

    // Creating a keyboard p5js instance for the keyboard
    p.keyPressed = () => {
        // Only allow the ENTER key to progress the experiment once the probe has displayed and mouse stimulus has finished
        if (progress.matchDisplay && !progress.userchoice && !progress.probe) {
            if (matches == 0) {
                progress.clickPrompt = true;
                progress.promptstart = millis();
            } else {
                if (p.keyCode === p.ENTER) {
                    progress.stimDisplay = true;
                    progress.matchDisplay = false;
                    progress.crosshair = true;
                    progress.markerchoice = false;
                    progress.iti = p.millis();
                    progress.timestamp = p.millis();
                    if (progress.practice) {
                        progress.practice_trial++;
                        if (progress.practice_trial == exp.practiceTrials) {
                            progress.practice = false;
                        } else {
                            trialPrepare(awm);
                        };
                    } else {
                        saveChoices();
                        progress.current_trial++;
                        if (progress.current_trial == exp.nTrials) {
                            progress.expEnd = true;
                            progress.audPart1 = false;
                            progress.audPart2 = false;
                            trialFreq = []; trialAM = [];
                            matchFreq = []; matchAM = [];
                            taskresults.child(database_uid).child(timeprint).set({
                                'trialtype_order' : exp.taskorder,
                                'match_parameters' : exp.matches,
                                'reaction_times' : exp.matchtime,
                                'no_of_matches' : exp.matchno,
                                'trial_first_match' : exp.firstmatches,
                                'trial_multi_othertype' : exp.otheroptions,
                                'multi_otherparam' : exp.otherparams,
                                'trial_stim_param' : exp.stims,
                                'trial_probe_param' : exp.probes,
                                'GMSI' : GMSI.responses,
                                'matrix' : matrix.responses
                            }).catch(err => {
                                console.log(err.message);
                            });
                            task.wmtask = false;
                            canvas_div.style.display = 'none';
    
                            if (user_input.value == "demo") {
                                task_div.style.display = 'none';
                                comments_div.style.display = 'block';
                            };
    
                            // Check that all segments are completed and if so move to the Results page when the task is finished
                            if ((survey_segments_completed == survey_totsegments) && (matrix_segments_completed == matrix_totsegments) || task.visit_2) {
                                //results_div.style.display = 'block';
                                task_div.style.display = 'none';
                                comments_div.style.display = 'block';
                            };
                        } else if (progress.current_trial%exp.segmentTrials == 0) {
                            exp.segmentsCompleted++;
                            task.wmtask = false;
                            progress.segmentcomplete = true;
                            canvas_div.style.display = 'none';
                            inter_div.style.display = 'block';
                            AllocateSegment();    
                        } else {
                            trialPrepare(awm);
                        };
                    };
                };
            };
        };
    }
}     

// Create AWM Instance Mode
let awm;
function createAWM() {
    awm = new p5(awm_s, 'awm_div');
}

function ExpBegin(p5instance) {
    progress.hoverOption[4] = false;
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.textSize(40);
    p5instance.textStyle(p5instance.BOLD);
    p5instance.fill(100);
    p5instance.text('Start the Practice Session by Clicking Below', p5instance.width/2, p5instance.height/5);
    p5instance.fill(200);
    p5instance.stroke(0, 125);
    p5instance.strokeWeight(2);
    p5instance.rect(p5instance.width/2, p5instance.height/2 + 50, 550, 275, 50);
    introbutton1 = new IntroButton(p5instance.width/3.2, p5instance.height/2 + 50, 60);  
    introbutton1.show(awm); 
    progress.hoverOption[0] = hoverbutton(introbutton1.x, introbutton1.y, introbutton1.rad, progress.hoverOption[0], false, awm);
    p5instance.textAlign(p5instance.LEFT);
    p5instance.textFont('Arial');
    p5instance.textStyle(p5instance.NORMAL);
    p5instance.noStroke();
    if (!progress.hoverOption[0]) {
        p5instance.textSize(20);
        p5instance.fill(0, 100);
        p5instance.text('Start Practice', p5instance.width/2 - 100, p5instance.height/2 + 50);
    } else {
        p5instance.textSize(22);
        p5instance.fill(0, 200);
        p5instance.text('Start Practice', p5instance.width/2 - 100, p5instance.height/2 + 50);
    };
}

function Practice() {
    exp.practiceorder = [0, 1, 0, 1];
}

function PracticeMessage(p5instance) {
    if (!progress.crosshair) {
        p5instance.push();
        p5instance.fill(0, 100);
        p5instance.textSize(20);
        p5instance.text('Match the SOUND', p5instance.width/2, p5instance.height/5);
        p5instance.text('Press ENTER for the next trial', p5instance.width/2, p5instance.height*4/5);
        p5instance.pop();
    };
}

// Display just before the experiment starts after Practice
function ReadySet(p5instance) {
    document.body.style.cursor = 'default';
    p5instance.push();
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.textSize(40);
    p5instance.textStyle(p5instance.BOLD);
    p5instance.fill(100);
    p5instance.text('Click Below to Officially Start the Experiment', p5instance.width/2, p5instance.height/5);
    p5instance.pop();
    p5instance.fill(200);
    p5instance.stroke(0, 125);
    p5instance.strokeWeight(2);
    p5instance.rect(p5instance.width/2, p5instance.height/2 + 50, 550, 275, 50);
    p5instance.textSize(25);
    p5instance.fill(0, 200);
    p5instance.textAlign(p5instance.CENTER);
    p5instance.noStroke();
    p5instance.text('Good Luck', p5instance.width/2, p5instance.height*4.5/7 - 50);
    nextbutton2 = new IntroButton(p5instance.width/2, p5instance.height*3/4, 60);
    nextbutton2.show(awm); 
    progress.hoverOption[2] = hoverbutton(nextbutton2.x, nextbutton2.y, nextbutton2.rad, progress.hoverOption[2], false, awm);
}

class IntroButton {
    constructor(locX, locY, rad) {
        this.x = locX;
        this.y = locY;
        this.rad = rad
    };
    show(p5instance) {
        p5instance.fill(100, 125, 150, 100);
        p5instance.stroke(255);
        p5instance.strokeWeight(1);
        p5instance.circle(p5instance.random(this.x-1, this.x+1), p5instance.random(this.y-1, this.y+1), this.rad);
    };
}

function hoverbutton(x, y, r, hover, complete, p5instance) {
    if ((p5instance.dist(p5instance.mouseX, p5instance.mouseY, x, y) < r/2) && (complete === false)) {
        p5instance.fill(100, 125, 150, 255);
        p5instance.stroke(255);
        p5instance.strokeWeight(3);
        p5instance.circle(x, y, 70);
        hover = true;
    } else {
        hover = false;
    };
    return hover;
}

// Countdown from 3 to begin each segment
function Count2Start(p5instance) {
    if ((progress.practice && progress.prac_countdown) || (!progress.practice && (progress.current_trial == 0 || progress.segmentcomplete))) {
        if (p5instance.frameCount % 60 == 0) {
            progress.countdown--;
        };
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.textSize(100);
        if (progress.countdown == 0) {
            progress.expStart = false;
            progress.segmentcomplete = false;
            progress.prac_countdown = false;
            progress.crosshair = true;
            // setTimeout(() => {
            //     progress.crosshair = false;
            //     trialPrepare();
            //   }, p5instance.random(1400, 1600));
            progress.iti = p5instance.millis();
            progress.timestamp = p5instance.millis();
        } else {
            p5instance.fill(0);
            p5instance.text(progress.countdown, p5instance.width/2, p5instance.height/2);
        };
    };
}

// Fixation cross to divert participants attention to the centre of the screen where the visual stimuli are located
function CrossHair(p5instance) {
    if (progress.crosshair) {
        if ((progress.practice && progress.practice_trial == 0) || (!progress.practice && progress.current_trial == 0)) {
            if ((p5instance.millis() - progress.iti) < p5instance.random(1400, 1600)) {
                p5instance.fill(0);
                p5instance.text('+', p5instance.width/2, p5instance.height/2);
            } else {
                progress.crosshair = false;
                trialPrepare(awm);
            };
        } else {
            if ((p5instance.millis() - progress.iti) < p5instance.random(900, 1100)) {
                p5instance.fill(0);
                p5instance.text('+', p5instance.width/2, p5instance.height/2);
            } else {
                progress.crosshair = false;
                progress.frameSound = p5instance.frameCount;
            };
        };
    };
}

// Visual Masker between Stimulus and Matching Phase to interfere with 'Iconic' Memory
function StaticMasker(p5instance) {
    if (progress.masker && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
        if (progress.frameAudMask + 1 == p5instance.frameCount) {
            AudMasker();
        };
        if ((p5instance.millis() - progress.maskstart) < p5instance.random(400, 600)) {
            progress.masknoisepoint++;
            for (var i = 0; i < p5instance.width/2; i += 12) {
                for (var j = 0; j < p5instance.height/2; j += 12) {
                    p5instance.fill(p5instance.random(0,255), p5instance.random(0,255), p5instance.random(0,255));
                    p5instance.strokeWeight(0);
                    p5instance.rect(i+p5instance.width/4, j+p5instance.height/4, 24, 24);
                };
            };
        } else {
            progress.masknoisepoint = 0;
            progress.masker = false;
            progress.probe = true;
            progress.probestart = p5instance.millis();
            progress.frameSound = p5instance.frameCount;
        };
    } else {
        progress.masknoisepoint = 0;
        progress.masker = false;
        progress.probe = true;
        // progress.probestart = millis();
        progress.frameSound = frameCount;
    };
}

// Auditory Masker between Stimulus and Matching Phase to interfere with 'Echoic' Memory
function AudMasker() {
    var duration = 0.5;
    let Tone = Math.random() * (880 - 440) + 440;;
    var pip_dur = 0.01; 
    var no_pips = duration/pip_dur;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var myArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < myArrayBuffer.length; i++) {
            if (i % (audioCtx.sampleRate/no_pips) == 0) {
                Tone = Math.random() * (880 - 440) + 440;
            };
            nowBuffering[i] = Math.sin(2*Math.PI*(Tone)*(i/audioCtx.sampleRate));
        };
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
}

// This function prompts the user to Click on the slider to choose an answer before pressing Enter
function ClickPrompt(p5instance) {
    if (progress.clickPrompt) {
        if (p5instance.millis() - progress.promptstart < 750) {
            p5instance.push();
            p5instance.fill(0, 100);
            p5instance.textSize(20);
            p5instance.text('LEFT-CLICK to make a CHOICE with your MOUSE', p5instance.width/2, p5instance.height/2 - 40);
            p5instance.pop();
        } else {
            progress.clickPrompt = false;
        };
    };
}

// Main Trial Loop - Step by Step Comments in Place
function ExpTrial(p5instance) {
    // Checks of stimDisplay is 'true' and progress.crosshair is 'false'
    if (progress.stimDisplay && !progress.crosshair) {
        if (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials)) {
            // Hides cursor as its location could influence participant choice
            document.body.style.cursor = 'none';
            // The Inter-Stimulus-Interval between the Probe stimulus and Matching Probe is 2500 to 4000 milliseconds
            if (p5instance.millis() - progress.timestamp > p5instance.random(2500, 4000)) {
                if (progress.audPart2) {    
                    noise.stop();
                    mod.stop();
                };
                progress.stimDisplay = false;
                progress.matchDisplay = true;
                progress.masker = true;
                progress.maskstart = p5instance.millis();
                progress.frameAudMask = p5instance.frameCount;
            // The loop below is run until the ISI is reached
            } else {
                if (progress.audPart1) {     // Pure Tone Trial
                    //console.log('frequency parameter stim is ... ' + Freq);
                    if (progress.frameSound + 1 === p5instance.frameCount) {
                        playSound(p5instance);
                    }; 
                } else if (progress.audPart2) {     // AM Trial
                    //console.log('AM rate stim is ... ' + AM);
                    if (progress.frameSound + 1 === p5instance.frameCount) {
                        playSound(p5instance);
                    }; 
                };
            };
        } else {
            noise.stop();
            mod.stop();
            progress.stimDisplay = false;
            progress.matchDisplay = true;
            progress.masker = true;
            progress.maskstart = p5instance.millis();
            progress.frameAudMask = p5instance.frameCount;
        };

    // Matching part of the Trial
    } else if (progress.matchDisplay) {
        // Masker to interfere with echoic and iconic memory
        if (progress.masker) {
            StaticMasker(awm);
        // Once the Probe is displayed or heard the Matching phase starts
        } else {
            document.body.style.cursor = 'default'; 
            markerUpdate(awm);
            ClickPrompt(awm);
            // Pure Tone Frequency Matching
            if (progress.audPart1) {
                displaySlider(awm);
                p5instance.push();
                p5instance.fill(0, 100);
                p5instance.textSize(20);
                if (progress.current_trial < exp.aud1_nTrials) {
                    p5instance.text('Match the SOUND', p5instance.width/2, p5instance.height/5);
                } else if ((progress.current_trial >= exp.aud1_nTrials) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                    p5instance.text('Click where you think the SOUND is LOCATED on the scale', p5instance.width/2, p5instance.height/5);
                } else {
                    p5instance.text('Click on the scale (move the marker) where the two sounds MATCH', p5instance.width/2, p5instance.height/5);
                };
                p5instance.text('Press ENTER for the next trial', p5instance.width/2, p5instance.height*4/5);
                p5instance.fill(10, 225);
                p5instance.rect(p5instance.constrain(p5instance.mouseX, 200, 800), p5instance.height*2/3, 10, 40, 20, 20, 20, 20);
                p5instance.pop();
                // Probe is shown or played
                if (progress.probe) {
                    if ((p5instance.millis() - progress.probestart < 1000) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                        ProbeStim(awm);
                    } else {
                        progress.probe = false;
                        taskRT = p5instance.millis();
                        progress.frameSound = p5instance.frameCount;
                        if ((progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials))) {
                            progress.percept = true;
                        };
                    };
                } else if (!progress.practice && progress.percept && (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials))) {
                    if ((p5instance.millis() - progress.probestart < 2000) && (p5instance.millis() - progress.probestart > 1000)) {
                        if (progress.frameSound + 1 === p5instance.frameCount) {
                            playSound(p5instance);
                        };
                    } else {
                        progress.percept = false;
                    };
                // Once the participant makes a choice on the Scale the corresponding choice is displayed for 1000ms
                } else if (progress.userchoice) {
                    if ((p5instance.millis() - progress.matchstart > 1000) && ((progress.current_trial < exp.aud1_nTrials) || (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)))) {
                        if (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)) {
                            progress.userchoice_count += 1;
                        };
                        progress.frameSound = p5instance.frameCount;
                        if (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)) {
                            progress.percept = true;
                            if (progress.frameSound == p5instance.frameCount) {
                                playSound(p5instance);
                            };
                            if (p5instance.millis() - progress.matchstart > 2000) {
                                progress.userchoice_count = 0;
                                progress.userchoice = false;
                            };
                        } else {
                            progress.percept = false;
                            progress.userchoice = false;
                        };
                    } else if ((progress.current_trial >= exp.aud1_nTrials) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                        progress.percept = false;
                        progress.userchoice = false;
                    };
                };
                if (progress.markerchoice) {
                    markerUpdate(awm);
                };
            // AM Rate Matching
            } else if (progress.audPart2) {
                displaySlider(awm);
                p5instance.push();
                p5instance.fill(0, 100);
                p5instance.textSize(20);
                if (progress.current_trial < exp.aud1_nTrials) {
                    p5instance.text('Match the SOUND', p5instance.width/2, p5instance.height/5);
                } else if ((progress.current_trial >= exp.aud1_nTrials) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                    p5instance.text('Click where you think the SOUND is LOCATED on the scale', p5instance.width/2, p5instance.height/5);
                } else {
                    p5instance.text('Click on the scale (move the marker) where the two sounds MATCH', p5instance.width/2, p5instance.height/5);
                };
                p5instance.text('Press ENTER for the next trial', p5instance.width/2, p5instance.height*4/5);
                p5instance.fill(10, 225);
                p5instance.rect(p5instance.constrain(p5instance.mouseX, 200, 800), p5instance.height*2/3, 10, 40, 20, 20, 20, 20);
                p5instance.pop();
                if (p5instance.millis() - progress.noiseduration > 900) {
                    noise.stop();
                    mod.stop();
                };
                // Probe is shown or played
                if (progress.probe) {
                    if ((p5instance.millis() - progress.probestart < 1000) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                        ProbeStim(awm);
                    } else {
                        progress.probe = false;
                        noise.stop();
                        mod.stop();
                        taskRT = p5instance.millis();
                        progress.frameSound = p5instance.frameCount;
                        if ((progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials))) {
                            progress.percept = true;
                        };
                    };
                } else if (progress.percept && (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials))) {
                    if ((p5instance.millis() - progress.probestart < 2000) && (p5instance.millis() - progress.probestart > 1000)) {
                        if (progress.frameSound + 1 === p5instance.frameCount) {
                            playSound(p5instance);
                        };
                    } else {
                        progress.percept = false;
                    };
                // Once the participant makes a choice on the Scale the corresponding choice is displayed for 1000ms
                } else if (progress.userchoice) {
                    if ((p5instance.millis() - progress.matchstart > 1001) && ((progress.current_trial < exp.aud1_nTrials) || (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)))) {
                        if (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)) {
                            progress.userchoice_count += 1;
                        };
                        progress.frameSound = p5instance.frameCount;
                        if (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials)) {
                            progress.percept = true;
                            if (progress.frameSound == p5instance.frameCount) {
                                playSound(p5instance);
                            };
                            if (p5instance.millis() - progress.matchstart > 2001) {
                                progress.userchoice_count = 0;
                                progress.userchoice = false;
                                noise.stop();
                                mod.stop();
                            };
                        } else {
                            progress.percept = false;
                            progress.userchoice = false;
                        };
                    } else if ((progress.current_trial >= exp.aud1_nTrials) && (progress.current_trial < (exp.aud1_nTrials + exp.aud2_nTrials))) {
                        progress.percept = false;
                        progress.userchoice = false;
                    };
                };
                if (progress.markerchoice) {
                    markerUpdate(awm);
                };
            };
        };
    };
} 

function TaskOver(p5instance) {
    if (progress.expEnd) {
        document.body.style.cursor = 'default';
        p5instance.fill(200);
        p5instance.stroke(0, 125);
        p5instance.strokeWeight(2);
        p5instance.rect(p5instance.width/2, p5instance.height/2 + 50, 550, 275, 50);
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.textSize(40);
        p5instance.noStroke();
        p5instance.fill(100);
        p5instance.text("Thank you for your time!", p5instance.width/2, p5instance.height/4);
        p5instance.textAlign(p5instance.LEFT);
        outrobutton1 = new IntroButton(p5instance.width/3.2, p5instance.height/2 + 40, 60);
        outrobutton1.show(awm); 
        progress.hoverOption[1] = hoverbutton(outrobutton1.x, outrobutton1.y, outrobutton1.rad, progress.hoverOption[1], false);
        p5instance.textFont('Arial');
        p5instance.noStroke();
        if (!progress.hoverOption[1]) {
            p5instance.textSize(20);
            p5instance.fill(0, 100);
            p5instance.text('Click Here', p5instance.width/2.5, p5instance.height/2 + 40);
        } else {
            p5instance.textSize(22);
            p5instance.fill(0, 200);
            p5instance.text('Click Here', p5instance.width/2.5, p5instance.height/2 + 40);
        };
    };
}

// This function controls operations associated with clicking on Buttons or on the Scale of the Matching part of the task
var awmMousePressed = () => {
    if (audcog.awm) {
        if (progress.begin && progress.hoverOption[0]) {
            progress.begin = false;
            progress.practice = true;
            progress.ready_set = true;
            progress.prac_countdown = true;
            GenParams(awm);
            Practice();
        } else if (progress.ready_set && progress.hoverOption[2]) {
            progress.ready_set = false;
            progress.practice = false;
            progress.expStart = true;
            progress.countdown = 3;
            progress.hoverOption[2] = false;
        } else if (!progress.expEnd && progress.matchDisplay) {
            if (!progress.userchoice && !progress.probe && !progress.percept) {
                progress.userchoice = true;
                progress.markerchoice = true;
                progress.matchstart = awm.millis();
                mouseUpdateMatch(awm);
                if (progress.audPart1) {
                    // pass
                } else if (progress.audPart2) {
                    progress.noiseduration = awm.millis();
                };
                matches++;
            };
        } else if (progress.expEnd) {
            if (progress.hoverOption[1]) {
                task.wmtask = false;
                progress.begin = false;
                progress.expStart = false;
                progress.expEnd = false;
                progress.seeResults = true;
                progress.countdown = 3;
                progress.current_trial = 0;
                progress.practice_trial = 0;
                //DisplayResults();
                task_div.style.display = 'none';
                comments_div.style.display = 'block';
            };
        };
    };
}

// This function controls what happens when buttons on the Keyboard are pressed. Only ENTER is relevant here.
var awmKeyPressed = () => {
    // Only allow the ENTER key to progress the experiment once the probe has displayed and mouse stimulus has finished
    if (progress.matchDisplay && !progress.userchoice && !progress.probe) {
        if (matches == 0) {
            progress.clickPrompt = true;
            progress.promptstart = millis();
        } else {
            if (keyCode === awm.ENTER) {
                progress.stimDisplay = true;
                progress.matchDisplay = false;
                progress.crosshair = true;
                progress.markerchoice = false;
                progress.iti = p5instance.millis();
                progress.timestamp = p5instance.millis();
                if (progress.practice) {
                    progress.practice_trial++;
                    if (progress.practice_trial == exp.practiceTrials) {
                        progress.practice = false;
                    } else {
                        trialPrepare(awm);
                    };
                } else {
                    saveChoices();
                    progress.current_trial++;
                    if (progress.current_trial == exp.nTrials) {
                        progress.expEnd = true;
                        progress.audPart1 = false;
                        progress.audPart2 = false;
                        trialFreq = []; trialAM = [];
                        matchFreq = []; matchAM = [];
                        taskresults.child(database_uid).child(timeprint).set({
                            'trialtype_order' : exp.taskorder,
                            'match_parameters' : exp.matches,
                            'reaction_times' : exp.matchtime,
                            'no_of_matches' : exp.matchno,
                            'trial_first_match' : exp.firstmatches,
                            'trial_multi_othertype' : exp.otheroptions,
                            'multi_otherparam' : exp.otherparams,
                            'trial_stim_param' : exp.stims,
                            'trial_probe_param' : exp.probes,
                            'GMSI' : GMSI.responses,
                            'matrix' : matrix.responses
                        }).catch(err => {
                            console.log(err.message);
                        });
                        task.wmtask = false;
                        canvas_div.style.display = 'none';

                        if (user_input.value == "demo") {
                            task_div.style.display = 'none';
                            comments_div.style.display = 'block';
                        };

                        // Check that all segments are completed and if so move to the Results page when the task is finished
                        if ((survey_segments_completed == survey_totsegments) && (matrix_segments_completed == matrix_totsegments) || task.visit_2) {
                            //results_div.style.display = 'block';
                            task_div.style.display = 'none';
                            comments_div.style.display = 'block';
                        };
                    } else if (progress.current_trial%exp.segmentTrials == 0) {
                        exp.segmentsCompleted++;
                        task.wmtask = false;
                        progress.segmentcomplete = true;
                        canvas_div.style.display = 'none';
                        inter_div.style.display = 'block';
                        AllocateSegment();    
                    } else {
                        trialPrepare(awm);
                    };
                };
            };
        };
    };
}

// Update Frequency parameter for the trial and the 'other' parameter for Sound distractor in an Visual trial
function trialUpdateFreq(p5instance) {
    Freq = p5instance.random(aud.freq_low, aud.freq_high);
    if (progress.audPart1) {
        probeParam = p5instance.random(aud.freq_low, aud.freq_high);
    };
    if (!progress.practice) {
        if ((progress.visPart1 || progress.visPart2) && other_option == 1) {
            exp.otherparams.push(Freq);
        } else {
            trialFreq.push(Freq);
        };
    };
}

// Update AM parameter for the trial and the 'other' parameter for Sound distractor in an Visual trial
function trialUpdateAM(p5instance) {
    AM = p5instance.random(aud.am_low, aud.am_high);
    if (progress.audPart2) {
        probeParam = p5instance.random(aud.am_low, aud.am_high);
    };
    if (!progress.practice) {
        if ((progress.visPart1 || progress.visPart2) && other_option == 2) {
            exp.otherparams.push(AM);
        } else {
            trialAM.push(AM);
        };
    };
}

// Playing the Auditory Stimulus and Probe in each trial after the trialUpdate..() functions are performed
function playSound(p5instance) {
    if (progress.userchoice && (progress.userchoice_count == 1) || progress.stimDisplay || progress.probe || (millis() - progress.probestart < 2000) && (millis() - progress.probestart > 1000)) {
        if (progress.audPart1){
            //Pure Tone
            let tone = new p5.Oscillator('sine');
            let env = new p5.Envelope();
            env.setADSR(0.01, 0.95, 0.1, 0.01)
            tone.amp(env);
            if (progress.probe) {
                tone.freq(probeParam);
            } else {
                tone.freq(Freq);
            };
            tone.start();
            env.play();
            tone.stop(1);
        } else if (progress.audPart2) {
            //AM Noise
            mod = new p5.Oscillator('sine');
            if (progress.probe) {
                mod.freq(probeParam);
            } else {
                mod.freq(AM);
            };
            mod.disconnect();
            mod.start();
            noise = new p5.Noise('brown');
            noise.amp(mod, 0.1);
            noise.start();
            progress.noiseduration = p5instance.millis();
        };
    };
}

// Function controling the display of the Probe before the matching phase
function ProbeStim(p5instance) {
    if (progress.probe) {
        if (progress.audPart1) {
            if (progress.frameSound + 1 === p5instance.frameCount) {
                playSound(p5instance);
            }; 
            probeX = p5instance.map(probeParam, aud.freq_low, aud.freq_high, 200, 800);
            //console.log('the probe parameter is ...' + probeParam);
        } else if (progress.audPart2) {
            if (progress.frameSound + 1 === p5instance.frameCount) {
                playSound(p5instance);
            }; 
            probeX = p5instance.map(probeParam, aud.am_low, aud.am_high, 200, 800);
            //console.log('the probe parameter is ...' + probeParam);
        };
    };
}

function mouseUpdateMatch(p5instance) {
    sliderX = p5instance.mouseX;
    if ((progress.current_trial < exp.aud1_nTrials) || (progress.current_trial >= (exp.aud1_nTrials + exp.aud2_nTrials))) {
        if (progress.audPart1) {
            Xtransform = p5instance.map(p5instance.mouseX, 200, 800, aud.freq_low, aud.freq_high);
            //console.log('sound parameter match is ... ' + Xtransform);
            let tone = new p5.Oscillator('sine');
            let env = new p5.Envelope();
            env.setADSR(0.01, 0.95, 0.1, 0.01)
            tone.amp(env);
            tone.freq(Xtransform);
            tone.start();
            env.play();
            tone.stop(1);
            if (!progress.practice && (matches == 0)) {
                exp.firstmatches.push(Xtransform);
            };
        } else if (progress.audPart2) {
            Xtransform = p5instance.map(p5instance.mouseX, 200, 800, aud.am_low, aud.am_high);
            //console.log('sound parameter match is ... ' + Xtransform);
            mod = new p5.Oscillator('sine');
            mod.freq(Xtransform);
            mod.disconnect();
            mod.start();
            noise = new p5.Noise('brown');
            noise.amp(mod, 0.1);
            noise.start();
            //no protect
            if (!progress.practice && (matches == 0)) {
                exp.firstmatches.push(Xtransform);
            };
        };
    } else {
        if (progress.audPart1) {
            Xtransform = map(mouseX, 200, 800, aud.freq_low, aud.freq_high);
        } else if (progress.audPart2) {
            Xtransform = map(mouseX, 200, 800, aud.am_low, aud.am_high);
        };
        if (!progress.practice && (matches == 0)) {
            exp.firstmatches.push(Xtransform);
        };
    };
}

// Updates the location of the Red Marker above the slider when the Probe is initially displayed and a Match is made
function markerUpdate(p5instance) {
    p5instance.push();
    p5instance.strokeWeight(2);
    p5instance.stroke(125, 0, 0);
    p5instance.fill('red');
    if (!progress.markerchoice) {
        p5instance.triangle(p5instance.constrain(probeX, 200, 800), p5instance.height/2 + 50, probeX - 10, p5instance.height/2 + 35, probeX + 10, p5instance.height/2 + 35);
    } else {
        p5instance.triangle(p5instance.constrain(sliderX, 200, 800), p5instance.height/2 + 50, sliderX - 10, p5instance.height/2 + 35, sliderX + 10, p5instance.height/2 + 35);
    };
    p5instance.pop();
}

// Display the Slider on the screen as a long rectangle
function displaySlider(p5instance) {
    p5instance.push();
    p5instance.stroke(200);
    p5instance.fill(50);
    p5instance.rect(p5instance.width/2, p5instance.height*2/3, 600, 5, 10, 10, 10, 10);
    p5instance.pop();
}

// Append trial parameters and choices into the master 'exp' list
function saveChoices() {
    taskRT = millis() - taskRT;
    if (progress.audPart1) {
        exp.stims.push(Freq);
        exp.probes.push(probeParam);
        exp.matches.push(Xtransform);
    } else if (progress.audPart2) {
        exp.stims.push(AM);
        exp.probes.push(probeParam);
        exp.matches.push(Xtransform);
    };
    exp.matchno.push(matches);
    exp.matchtime.push(taskRT);
}

// Experimental conditions for each trial are created and shuffled
//
// There are 2 conditions in all:
// 1. Auditory Only Pure Tone WM
// 2. Auditory Only AM WM

function GenParams(p5instance) {
    trial_list = [];
    for (var i = 1; i <= exp.aud1_nTrials; i++) {
        if (i <= exp.aud1_nTrials/2) {
            trial_list.push(0);
        } else {
            trial_list.push(1);
        }
    };
    exp.taskorder = exp.taskorder.concat(p5instance.shuffle(trial_list));

    trial_list = [];
    for (var i = 1; i <= exp.aud2_nTrials; i++) {
        if (i <= exp.aud2_nTrials/2) {
            trial_list.push(0);
        } else {
            trial_list.push(1);
        }
    };
    exp.taskorder = exp.taskorder.concat(p5instance.shuffle(trial_list));

    trial_list = [];
    for (var i = 1; i <= exp.aud3_nTrials; i++) {
        if (i <= exp.aud3_nTrials/2) {
            trial_list.push(0);
        } else {
            trial_list.push(1);
        }
    };
    exp.taskorder = exp.taskorder.concat(p5instance.shuffle(trial_list));

}

function trialPrepare(p5instance) {
    // Matches are not recorded in Practice trials
    if (!progress.practice) {
        matches = 0;
    }

    // Toggles through exp.taskorder and sets the appropriate progress.xxxx part to 'true', then initialises the specific parameters for this
    if (!progress.practice && (exp.taskorder[progress.current_trial] == 0) || progress.practice && (exp.practiceorder[progress.practice_trial] == 0)) {
        progress.audPart1 = true;
        progress.audPart2 = false;
        progress.frameSound = p5instance.frameCount;
        trialUpdateFreq(awm);
    } else if (!progress.practice && (exp.taskorder[progress.current_trial] == 1 ) || progress.practice && (exp.practiceorder[progress.practice_trial] == 1)) {
        progress.audPart1 = false;
        progress.audPart2 = true;
        progress.frameSound = p5instance.frameCount;
        trialUpdateAM(awm);
    }; 
}