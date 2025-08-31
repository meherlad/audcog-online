// This script includes code for controlling the state of the Experimental workflow
//
// In debugging mode, a p5js canvas displays buttons that allow a user to test each task
// 
// In experimental mode, the user is taken directly to a set of general instructions and progresses to each task
//


// Generic Classes and Functions

class Button {
    constructor(locX, locY, rad, p5instance) {
        this.x = locX;
        this.y = locY;
        this.rad = rad;
        this.hovering = false;
        this.p5instance = p5instance;
    };
    show(p5instance) {
        p5instance.push();
        p5instance.fill(255, 255, 255, 150);
        p5instance.stroke(100);
        p5instance.strokeWeight(1);
        p5instance.circle(this.x, this.y, this.rad);
        p5instance.pop();
    };
    hover(px, py, p5instance) {
        if (p5instance.dist(px, py, this.x, this.y) < this.rad / 2) {
            p5instance.push();
            p5instance.fill('red');
            p5instance.stroke(100);
            p5instance.strokeWeight(3);
            p5instance.circle(this.x, this.y, this.rad + 10);
            this.hovering = true;
            p5instance.pop();
        } else {
            this.hovering = false;
        };
    };
}

// All clickable buttons with words, during the response phase, are produced with this class
class choiceBox {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 50;
        this.textSize = 20
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
        p5instance.textSize(this.textSize);
        p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
        p5instance.text(this.text, this.x, this.y);
        p5instance.strokeWeight(2);
        p5instance.stroke(255);
        p5instance.pop();
    }

    mouseisover(px, py) {
        if (this.pressed == false) {
            if ((Math.abs(this.x - px) < this.width / 2) && (Math.abs(this.y - py) < this.height / 2)) {
                this.fillVal = 200;
                this.over = true;
            } else {
                this.fillVal = 225;
                this.over = false;
            };
        } else {
            if ((Math.abs(this.x - px) < this.width / 2) && (Math.abs(this.y - py) < this.height / 2)) {
                this.fillVal = 100;
                this.over = true;
            } else {
                this.fillVal = 125;
                this.over = false;
            };
        };
    }

    clicked() {
        this.fillVal = 125;
        this.pressed = true;
    }
}

class playButton {
    constructor(locX1, locX2, locY1, locY2, locZ1, locZ2) {
        this.x1 = locX1;
        this.y1 = locY1;
        this.z1 = locZ1;
        this.x2 = locX2;
        this.y2 = locY2;
        this.z2 = locZ2;
        this.hovering = false;
        this.pressed = false;
        this.fillVal = 'red';
    };
    show(p5instance) {
        p5instance.push();
        p5instance.fill('white');
        p5instance.rect(this.x1 + 25, this.z2, 100, 80);
        p5instance.fill(this.fillVal);
        if (!this.pressed) {
            p5instance.triangle(this.x1, this.x2, this.y1, this.y2, this.z1, this.z2);
        } else {
            p5instance.rect(this.x1 + 10, this.z2, 20, 60);
            p5instance.rect(this.x1 + 40, this.z2, 20, 60);
        };
        p5instance.pop();
    };
    hover(px, py, p5instance) {
        if (p5instance.dist(px, py, this.z1 - 25, this.z2) < 50) {
            p5instance.push();
            p5instance.fill('grey');
            p5instance.rect(this.x1 + 25, this.z2, 100, 80);
            p5instance.fill(this.fillVal);
            if (!this.pressed) {
                p5instance.triangle(this.x1, this.x2, this.y1, this.y2, this.z1, this.z2);
            } else {
                p5instance.rect(this.x1 + 10, this.z2, 20, 60);
                p5instance.rect(this.x1 + 40, this.z2, 20, 60);
            };
            p5instance.pop();
            this.hovering = true;
        } else {
            this.hovering = false;
        };
    };
    clicked() {
        this.pressed = !this.pressed;
        if (this.pressed) {
            this.fillVal = 'green';
        } else {
            this.fillVal = 'red';
        };
    };
}

// Global Experimental Variables

// audcog controls event handlers for each task
let audcog = {
    toc: true,
    sib: false,
    awm: false,
    din: false,
    gmsi: false,
    demog: false
}

// The 'introHandler' relates to different parts of the checks in the introduction
//
//  0 = Welcome Video
//  1 = Consent
//  2 = Task Video
//  3 = Ready to Begin
//

// The 'allExpHandler' relates to different parts of the experiment
//
//  0 = Introduction (state determined by 'introState')
//  1 = First Task
//  -1 = Inter Task State (for a break)
//  2 = Second Task
//  3 = Third Task etc. etc.
//
//  For AudCog the sequence is -- Introduction >> Task 1 >> Task 2 >> Task 3
//


class expState {
    constructor(state) {
        this.state = 0;
    };
}

// Shuffle task order and interleave with break sections [-1] and forms
//
//  1 - DiN, 2 - SiB, 3 - AWM, 4 - Musical Sophistication, 5 - Demographics
//
let expOrder = [99, 0];
let expTasks;

// Build resume order from a user's database snapshot
function buildResumeOrderFromDbSnapshot(userSnap) {
    try {
        const exists = (path) => userSnap && userSnap.child(path) && userSnap.child(path).exists();
        const done = {
            din: exists('din'),
            sib: exists('sib'),
            awm: exists('awm'),
            demog: exists('misc') || exists('timings')
        };
        // GMSI complete if any child has 39 responses
        let gmsiComplete = false;
        if (exists('gmsi')) {
            const gmsiVal = userSnap.child('gmsi').val();
            if (gmsiVal) {
                for (let key in gmsiVal) {
                    const entry = gmsiVal[key];
                    if (entry && entry['GMSI responses'] && entry['GMSI responses'].length >= 39) {
                        gmsiComplete = true; break;
                    }
                }
            }
        }
        const remainingAudio = [];
        if (!done.din) remainingAudio.push(1);
        if (!done.sib) remainingAudio.push(2);
        if (!done.awm) remainingAudio.push(3);

        // Start with an empty order (skip consent on resume)
        let order = [];
        // Shuffle remaining audio tasks for variety
        const shuffled = shuffle(remainingAudio);
        const needsGmsi = !gmsiComplete;
        for (let i = 0; i < shuffled.length; i++) {
            order.push(shuffled[i]);
            if (needsGmsi) {
                order.push(-1);
                order.push(4); // GMSI block
                order.push(-1);
            } else {
                order.push(-1);
            }
        }
        if (needsGmsi && shuffled.length === 0) {
            // If only GMSI remains, run it alone
            order.push(4);
        }
        if (!done.demog) {
            order.push(5);
        }
        // If nothing remains, keep empty and controller will show debrief/debug
        return order.length ? order : expOrder;
    } catch (e) {
        return expOrder;
    }
}
// Expose globally for main.js
window.buildResumeOrderFromDb = buildResumeOrderFromDbSnapshot;

// For AudCog only see below
function createTaskOrder() {
    // If a precomputed resume order exists, use it
    if (window.__resumeOrder && Array.isArray(window.__resumeOrder)) {
        expOrder = [99];
        // Do not add consent (0) on resume; just load remaining order
        for (let i = 0; i < window.__resumeOrder.length; i++) {
            expOrder.push(window.__resumeOrder[i]);
        }
        return;
    }
    expTasks = shuffle([1, 2, 3]);
    for (let i = 0; i < expTasks.length; i++) {
        expOrder.push(expTasks[i]);
        expOrder.push(-1);
        expOrder.push(4);
        expOrder.push(-1);
    };
    expOrder.push(5);
}


// Create the Controller p5js Instance
let allExpHandler;
let vidIntro, imgInterAud, imgInterGMSI;
const controller_s = p => {

    // Setup p5js Canvas
    p.setup = () => {
        allExpHandler = new expState();
        imgInterGMSI = p.loadImage('static/images/main/Questionnaire Next Divider.jpg');
        imgInterAud = p.loadImage('static/images/main/Auditory Next Divider.jpg');
        vidIntro = p.createVideo("static/videos/audcog_prevent_intro.mp4");
        vidIntro.size(800, 500);
        vidIntro.hide();
        vidIntro.volume(1);
        vidIntro.play();

        if (userID == 'debug') {
            canvas = p.createCanvas(900, 700);
            vidIntro.pause();
            vidIntro.hide();
        } else {
            canvas = p.createCanvas(900, 700);
        };

        canvas.mousePressed(controllerMousePressed);
        createInterface(userID);

        p.rectMode(p.CENTER);
        p.imageMode(p.CENTER);

    };

    // Draw p5js Canvas
    p.draw = () => {
        p.background(255);
        if (allExpHandler.state == 0) {
            if (debug) {
                displayDebug();
            } else {
                displayChecks();
            };
        } else if (allExpHandler.state < expOrder.length) {
            displayMainExp();
        } else {

        };
    };
}

// Function to be executed when mouse is pressed on controller canvas
let panChoice = 1;
let checksNextAllow = true; let letHugginsPlay = true;
var controllerMousePressed = () => {
    if ((userID != 'debug') && allExpHandler.state == 0) {
        if (buttonIntro.hovering) {
            buttonIntro.hovering = false;
            checksNextAllow = false;
            vidIntro.pause();
            //vidIntro.hide();
            allExpHandler.state += 1;
            createTaskOrder();
            chooseTask();
        };
    } else if (userID == 'debug' || allExpHandler.state != 0) {
        chooseTask();
        if (buttonInterNext.hovering) {
            allExpHandler.state += 1;
            chooseTask();
        };
    };
}

// Toggle p5js setup commands depending on userID
let buttonDEM, buttonAWM, buttonDIN, buttonSIB, buttonInterNext, buttonIntro, buttonGMSI;
function createInterface(uid) {
    buttonDIN = new Button(controller.width / 2 - 170, 100, 40, controller);
    buttonSIB = new Button(controller.width / 2 - 170, 200, 40, controller);
    buttonAWM = new Button(controller.width / 2 - 170, 300, 40, controller);
    buttonGMSI = new Button(controller.width / 2 - 170, 400, 40, controller);
    buttonDEM = new Button(controller.width / 2 - 170, 500, 40, controller);
    buttonIntro = new Button(controller.width / 2, 620, 50, controller);
    buttonInterNext = new Button(controller.width / 2, 620, 50, controller);
}

function chooseTask() {
    if (allExpHandler.state < expOrder.length) {
        if (expOrder[allExpHandler.state] == 0) {
            document.getElementById('title_div').innerHTML = "Consent Form";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'block';
            audcog.toc = false;
        } else if (buttonDIN.hovering || expOrder[allExpHandler.state] == 1) {
            document.getElementById('title_div').innerHTML = "Digits-in-Noise Task";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'none';
            document.getElementById('din_div').style.display = 'block';
            audcog.din = true;
            audcog.toc = false;
            createDIN();
        } else if (buttonSIB.hovering || expOrder[allExpHandler.state] == 2) {
            document.getElementById('title_div').innerHTML = "Speech-in-Noise Perception";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'none';
            document.getElementById('sib_div').style.display = 'block';
            audcog.sib = true;
            audcog.toc = false;
            createSIB();
        } else if (buttonAWM.hovering || expOrder[allExpHandler.state] == 3) {
            document.getElementById('title_div').innerHTML = "Auditory Working Memory";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'none';
            document.getElementById('awm_div').style.display = 'block';
            audcog.awm = true;
            audcog.toc = false;
            createAWM();
        } else if (buttonGMSI.hovering || expOrder[allExpHandler.state] == 4) {
            document.getElementById('title_div').innerHTML = "Musical Sophistication Survey";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'none';
            document.getElementById('gmsi_div').style.display = 'block';
            audcog.gmsi = true;
            audcog.toc = false;
            loadGMSIQuestion();
        } else if (buttonDEM.hovering || expOrder[allExpHandler.state] == 5) {
            document.getElementById('title_div').innerHTML = "Demographics";
            document.getElementById('controller_div').style.display = 'none';
            document.getElementById('consent_div').style.display = 'none';
            document.getElementById('demog_div').style.display = 'block';
            audcog.demog = true;
            audcog.toc = false;
        };
    } else {
        if (userID == 'demo') {
            downloadDemoResults();
        };
    };
}

// Create Controller Instance Mode
let controller;
function createController() {
    controller = new p5(controller_s, 'controller_div');
    controller.debug = debug;
}

// Display DEBUG Interface
function displayDebug() {
    if (audcog.toc) {
        document.getElementById('title_div').innerHTML = "Debug Mode";
    };
    controller.textSize(25);
    controller.text('Digits in Noise', controller.width / 2 - 60, 110);
    buttonDIN.show(controller);
    buttonDIN.hover(controller.mouseX, controller.mouseY, controller);
    controller.textSize(25);
    controller.text('Speech-in-Babble', controller.width / 2 - 60, 210);
    buttonSIB.show(controller);
    buttonSIB.hover(controller.mouseX, controller.mouseY, controller);
    controller.textSize(25);
    controller.text('Auditory Working Memory', controller.width / 2 - 60, 310);
    buttonAWM.show(controller);
    buttonAWM.hover(controller.mouseX, controller.mouseY, controller);
    controller.textSize(25);
    controller.text('Gold-MSI', controller.width / 2 - 60, 410);
    buttonGMSI.show(controller);
    buttonGMSI.hover(controller.mouseX, controller.mouseY, controller);
    controller.textSize(25);
    controller.text('Demographics', controller.width / 2 - 60, 510);
    buttonDEM.show(controller);
    buttonDEM.hover(controller.mouseX, controller.mouseY, controller);
}

// Display Pre-task CHECKS Interface
function displayChecks() {
    if (allExpHandler.state == 0) {
        document.getElementById('title_div').innerHTML = "Welcome Video";
        
        if (vidIntro && vidIntro.get) {
            let img = vidIntro.get();
            controller.image(img, controller.width / 2, controller.height / 2 - 100);
        } else {
            // Fallback if video failed to load
            controller.textSize(20);
            controller.textAlign(controller.CENTER);
            controller.text("Welcome to the AudCog Study", controller.width / 2, controller.height / 2 - 50);
            controller.text("Please watch the introduction video", controller.width / 2, controller.height / 2);
            controller.text("(Video loading...)", controller.width / 2, controller.height / 2 + 30);
        }
        
        controller.textSize(30);
        controller.textAlign(controller.CENTER);
        controller.text("Click below after the video", controller.width / 2, 580);
        buttonIntro.show(controller);
        buttonIntro.hover(controller.mouseX, controller.mouseY, controller);
    };
}

function displayMainExp() {
    if (expOrder[allExpHandler.state] == -1) {
        displayInterTask();
    };
}

// Demographics Form Stuff below
let user_age = document.getElementById('userAge');
let Q1_1 = document.getElementById('Q1_1');
let Q1_2 = document.getElementById('Q1_2');
let Q2_1 = document.getElementById('Q2_1');
let Q2_2 = document.getElementById('Q2_2');
let Q2_3 = document.getElementById('Q2_3');
let Q2_4 = document.getElementById('Q2_4');
let Q2_5 = document.getElementById('Q2_5');
let Q3_1 = document.getElementById('Q3_1');
let Q3_2 = document.getElementById('Q3_2');
let Q3_3 = document.getElementById('Q3_3');
let Q4_1 = document.getElementById('Q4_1');
let Q4_2 = document.getElementById('Q4_2');
let Q5_1 = document.getElementById('Q5_1');
let Q5_2 = document.getElementById('Q5_2');
let Q5_3 = document.getElementById('Q5_3');
let Q6_1 = document.getElementById('Q6_1');
let Q6_2 = document.getElementById('Q6_2');
let thanks_alert = document.getElementById('thanks_alert');
let comments_box = document.getElementById('comments_box');

let consent_check;

function submitConsentForm() {
    allExpHandler.state += 1;
    chooseTask();
}

let age, sex, haids, headphones, comp, cardrisk, physical, famhist, inlab, haids_day, haids_yr;
function submitDemogForm() {
    if (user_age.value == "") {
        thanks_alert.innerHTML = 'Please enter your Age';
    } else if (!Q1_1.checked && !Q1_2.checked) {
        thanks_alert.innerHTML = 'Please answer the Second Question';
    } else if (!Q2_1.checked && !Q2_2.checked && !Q2_3.checked && !Q2_4.checked) {
        thanks_alert.innerHTML = 'Please enter the Third Question';
    } else if (!Q3_1.checked && !Q3_2.checked && !Q3_3.checked) {
        thanks_alert.innerHTML = 'Please enter the Fourth Question';
    } else if (!Q4_1.checked && !Q4_2.checked) {
        thanks_alert.innerHTML = 'Please enter the Fifth Question';
    } else if (!Q5_1.checked && !Q5_2.checked && !Q5_3.checked) {
        thanks_alert.innerHTML = 'Please enter the Sixth Question';
    } else if (!Q6_1.checked && !Q6_2.checked && !Q6_3.checked) {
        thanks_alert.innerHTML = 'Please enter the Seventh Question';
    } else {
        age = user_age.value;
        if (Q1_1.checked) {
            sex = 'male';
        } else if (Q1_2.checked) {
            sex = 'female';
        };
        if (Q2_1.checked) {
            comp = 'laptop';
        } else if (Q2_2.checked) {
            comp = 'desktop';
        } else if (Q2_3.checked) {
            comp = 'tablet/ipad';
        } else if (Q2_4.checked) {
            comp = 'mobile';
        };
        if (Q3_1.checked) {
            headphones = 'overear';
        } else if (Q3_2.checked) {
            headphones = 'inear';
        } else if (Q3_3.checked) {
            headphones = 'speakers';
        };
        if (Q4_1.checked) {
            haids = 'yes';
        } else if (Q4_2.checked) {
            haids = 'no';
        };
        if (Q5_1.checked) {
            haids_yr = 'na';
        } else if (Q5_2.checked) {
            haids_yr = 'low';
        } else if (Q5_3.checked) {
            haids_yr = 'high';
        };
        if (Q6_1.checked) {
            haids_day = 'na';
        } else if (Q6_2.checked) {
            haids_day = 'low';
        } else if (Q6_3.checked) {
            haids_day = 'high';
        };

        let date = new Date;
        let timeprint = `${("0" + (date.getDate())).slice(-2)}` + `${("0" + (date.getMonth() + 1)).slice(-2)}` + `${date.getFullYear()}` + `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;
        timings.expFinishTime = `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;


        taskresults.child(userID).child('misc').child(timeprint).set({
            'age': age,
            'comp': comp,
            'sex': sex,
            'haids': haids,
            'headphones': headphones,
        });
        taskresults.child(userID).child('timings').child(timeprint).set({
            'allStartTime': timings.expStartTime,
            'allFinishTime': timings.expFinishTime,
            'sibStartTime': timings.sibStartTime,
            'sibFinishTime': timings.sibFinishTime,
            'dinStartTime': timings.dinStartTime,
            'dinFinishTime': timings.dinFinishTime,
            'awmStartTime': timings.awmStartTime,
            'awmFinishTime': timings.awmFinishTime
        });
        taskresults.child(userID).update({ 'sessions': userVisits + 1 });
        taskresults.update({ 'visits': allVisits + 1 });
        taskresults.child(userID).child('comments').child(timeprint).set(comments_box.value);
        document.getElementById('demog_div').style.display = 'none';
        allExpHandler.state += 1;
        audcog.demog = false;

        if (userID == 'audcogncl') {
            document.getElementById('results_div').style.display = 'block';
            document.getElementById('sibThres').innerHTML = "The SIB Threshold is " + sibThreshold;
            document.getElementById('dinThres').innerHTML = "The DIN Threshold is " + dinThreshold;
            document.getElementById('freqPrec').innerHTML = "The Precision for Frequency is " + precisionFreqLoad1;
            document.getElementById('amPrec').innerHTML = "The Precision for AM Rate is " + precisionAMLoad1;
            displayAudCogNCLResults();
        } else if (userID == 'demo') {
            document.getElementById('title_div').innerHTML = "Debrief Information";
            document.getElementById('controller_div').style.display = 'block';
            document.getElementById('debrief_div').style.display = 'block';
        } else {
            document.getElementById('title_div').innerHTML = "Debrief Information";
            document.getElementById('controller_div').style.display = 'block';
            document.getElementById('debrief_div').style.display = 'block';
        };

        closeFullscreen();
    };
}

// Listens for the Consent Form button being clicked
document.getElementById('consentSubmitButton').addEventListener("click", submitConsentForm);

// Listens for the Demographic Form being clicked
document.getElementById('demogSubmitButton').addEventListener("click", submitDemogForm);

function displayInterTask() {
    document.getElementById('title_div').innerHTML = "Section Break";
    if ((expOrder[allExpHandler.state + 1] == 4) || (expOrder[allExpHandler.state + 1] == 5)) {
        controller.image(imgInterGMSI, controller.width / 2, controller.height / 2 - 100);
    } else {
        controller.image(imgInterAud, controller.width / 2, controller.height / 2 - 100);
    };
    controller.textSize(30);
    controller.textAlign(controller.CENTER);
    controller.text("Click the circle below to proceed", controller.width / 2, 580);
    buttonInterNext.show(controller);
    buttonInterNext.hover(controller.mouseX, controller.mouseY, controller);
}

// Some Helper Functions
//
// Shuffle array function
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle
    while (currentIndex != 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    };
    return array;
}

// Create evently spaced values from startValue to stopValue
function linSpace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}

// Takes a sound array and the required dB value to adjust sound array and plays it
function adjustSoundTMRdB(soundArray, dB, channels) {
    if (channels == 2) {
        for (let channel = 0; channel < 2; channel++) {
            for (let i = 0; i < soundArray[channel].length; i++) {
                soundArray[channel][i] = soundArray[channel][i] * Math.pow(10, dB / 20);
            };
        };
    } else {
        for (let i = 0; i < soundArray.length; i++) {
            soundArray[i] = soundArray[i] * Math.pow(10, dB / 20);
        };
    };
}

// Calculates threshold for task based on inputted last number of reversals
function calcThreshold(array, number) {
    let revs = [];
    for (let x = -number; x < 0; x++) {
        revs.push(array[array.length + x]);
    };
    return (revs.reduce((a, b) => a + b, 0) / revs.length);
}