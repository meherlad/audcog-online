// Javacript implementation of the Matrix Reasoning Task as described in 
//
// Chierchia, G., Fuhrmann, D., Knoll, L. J., Pi-Sunyer, B. P., Sakhardande, A. L., & Blakemore, S. J. (2019). 
// The matrix reasoning item bank (MaRs-IB): novel, open-access abstract reasoning items for adolescents and adults. 
// Royal Society Open Science, 6(10), 190232. DOI: https://doi.org/10.1098/rsos.190232
//
// This script only implements Minimal Difference Choice from Test Form 1 from Item Set 1
//
// Created by Meher Lad - August 2021
//

let mtxVars = {
    trials : undefined,
    strImage : 'tf1',
    pracList : [1, 2, 3],
    pracAns : [0, 3, 1],
    expTimeleft : 30,
    expTrialIdx : 0,
    expTrialImgIdx : 0,
    expList : [],              // Starts with item 4 then each new item is the 4th next index i.e. 8, 12 ...
    expResp : [],
    pracTrialIdx : 0,
    pracTrialImgIdx : 0,
    pracTrialCorr : false,
    pracImgList : [],
    pracImgOrder : [[1, 2, 3, 4], [2, 4, 3, 1], [4, 1, 2, 3]],
    imgList : [],
    imgOrder : [],
    totScore : 0
}


// This function controls the state of the Matrix Reasoning Task
//
// 0 brings a participant to the main instructions section
// 1 to the practice instructions
// 2 to the practice trial
// 3 to the main part of the experiment
//

class mtxState {
    constructor(state) {
        this.state = state;
    }
}

// This Class deals with Images and their Interactions
class imageBox {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 150;
        this.over = false;
        this.pressed = false;
        this.fillVal = 255;
        this.strokeWeight = 1;
        this.stroke = 0;
    }

    show(p5instance) {
        p5instance.push();
        p5instance.strokeWeight(this.strokeWeight);
        p5instance.stroke(this.stroke);
        p5instance.fill(this.fillVal);
        p5instance.rectMode(p5instance.CENTER);
        p5instance.rect(this.x, this.y, this.width, this.height, 10);
        p5instance.pop();
    }

    mouseisover(px, py, p5instance) {
        if (this.pressed == false) {
            if ((Math.abs(this.x - px) < this.width/2) && (Math.abs(this.y - py) < this.height/2)) {
                this.strokeWeight = 3;
                this.over = true;
            } else {
                this.strokeWeight = 1;
                this.over = false;
            };
        };
    }

    clicked() {
        this.stroke = 'rgb(255, 200, 0)';
        this.strokeWeight = 3;
        this.pressed = true;
    }
}

function mtxPrepareTrials(startItem, p5instance) {
    let x = startItem;
    for (x; x <= 80; x = x + 4) {
        mtxVars.expList.push(x);
    };

    // Generate random permutations for choice index per trial
    for (let i = 0; i < 20; i++) {
        let array = [1, 2, 3, 4];
        let trialArray = [];
        for (let i = 0; i < 4; i++) {
            trialArray.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
        };
        mtxVars.imgOrder.push(trialArray);
    };

    // Add images to imgList based on the random trial order permutations

    for (let i = 0; i < mtxVars.expList.length; i++) {
        mtxVars.imgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.expList[i]}_M.jpeg`));
        mtxVars.imgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.expList[i]}_T${mtxVars.imgOrder[i][0]}.jpeg`));
        mtxVars.imgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.expList[i]}_T${mtxVars.imgOrder[i][1]}.jpeg`));
        mtxVars.imgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.expList[i]}_T${mtxVars.imgOrder[i][2]}.jpeg`));
        mtxVars.imgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.expList[i]}_T${mtxVars.imgOrder[i][3]}.jpeg`));
    };

    // Prepare Practice Trials as above
    for (let i = 0; i < mtxVars.pracList.length; i++) {
        mtxVars.pracImgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.pracList[i]}_M.jpeg`));
        mtxVars.pracImgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.pracList[i]}_T${mtxVars.pracImgOrder[i][0]}.jpeg`));
        mtxVars.pracImgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.pracList[i]}_T${mtxVars.pracImgOrder[i][1]}.jpeg`));
        mtxVars.pracImgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.pracList[i]}_T${mtxVars.pracImgOrder[i][2]}.jpeg`));
        mtxVars.pracImgList.push(p5instance.loadImage(`static/images/mtx/${mtxVars.strImage}_${mtxVars.pracList[i]}_T${mtxVars.pracImgOrder[i][3]}.jpeg`));
    };
}

// Create the Matrix Reasoning Task p5js Instance
let mtxExpHandler;
let imageBoxes = [];
const mtx_s = p => {
    p.setup = () => {
        var canvas = p.createCanvas(1000, 800);
        canvas.mousePressed(mtxMousePressed);

        mtxExpHandler = new mtxState(0);
        
        mtxButtonInstruct = new Button(p.width/2 - 30, 750, 40, mtx);
        mtxButtonPracticeInstruct = new Button(p.width/2 - 75, 750, 40, mtx);
        mtxButtonPracticeCheck = new Button(p.width/2 - 100, 750, 40, mtx);
        mtxButtonPracticeNext = new Button(p.width/2 + 100, 750, 40, mtx);
        mtxButtonAccept = new Button(p.width/2 - 60, 750, 40, mtx);

        p.imageMode(p.CENTER);

        const startX = 200, stepX = 200;
        const startY = 600;

        for (let i = 0; i < 4; i++) {
            imageBoxes[i] = new imageBox(startX + (stepX * i), startY);
        }
    }

    // The main experimental loop on the HTML Canvas. This loops at 60Hz and experimental stages are controlled by sibExpHandler
    p.draw = () => {
        if (audcog.mtx) {
            p.background(255);
            if (mtxExpHandler.state == 0) {
                mtxInstructions(mtx);
            } else if (mtxExpHandler.state == 1) {
                mtxPracticeInstructions(mtx);
            } else if (mtxExpHandler.state == 2) {
                mtxPracticeTrial(mtx);
            } else if (mtxExpHandler.state == 3) {
                mtxMainExp(mtx);
            } else {
                
            };
        };
    }
}

// Mouse Press handler for the MTX task
var mtxMousePressed = () => {
    if (audcog.mtx) {
        if (mtxExpHandler.state == 0) {
            if (mtxButtonInstruct.hovering == true) {
                mtxExpHandler.state = 1;
                document.getElementById('title_div').innerHTML = "Instructions";
                flashInstructAlpha = 255;
            };
        } else if (mtxExpHandler.state == 1) {
            if (mtxButtonPracticeInstruct.hovering == true) {
                mtxExpHandler.state = 2;
                document.getElementById('title_div').innerHTML = "Practice - Sample 1";
                flashInstructAlpha = 255;
            };
        } else if ((mtxExpHandler.state == 2) || (mtxExpHandler.state == 3)) {

            // Controls the interaction with choices - a click changes the border of the chosen item only
            let boxCount = 0;
            if (imageBoxes[boxCount].over && !imageBoxes[boxCount].pressed) {
                imageBoxes[boxCount].clicked();
                for (var j = boxCount; j < boxCount + 4; j++) {
                    if (j != boxCount) {
                        imageBoxes[j].pressed = false;
                        imageBoxes[j].stroke = 0;
                    };
                };
            } else if (imageBoxes[boxCount + 1].over && !imageBoxes[boxCount + 1].pressed) {
                imageBoxes[boxCount + 1].clicked();
                for (var j = boxCount; j < boxCount + 4; j++) {
                    if (j != boxCount + 1) {
                        imageBoxes[j].pressed = false;
                        imageBoxes[j].stroke = 0;
                    };
                }; 
            } else if (imageBoxes[boxCount + 2].over && !imageBoxes[boxCount + 2].pressed) {
                imageBoxes[boxCount + 2].clicked();
                for (var j = boxCount; j < boxCount + 4; j++) {
                    if (j != boxCount + 2) {
                        imageBoxes[j].pressed = false;
                        imageBoxes[j].stroke = 0;
                    };
                }; 
            } else if (imageBoxes[boxCount + 3].over && !imageBoxes[boxCount + 3].pressed) {
                imageBoxes[boxCount + 3].clicked();
                for (var j = boxCount; j < boxCount + 4; j++) {
                    if (j != boxCount + 3) {
                        imageBoxes[j].pressed = false;
                        imageBoxes[j].stroke = 0;
                    };
                };  
            };

            if (mtxExpHandler.state == 2) {
                // In Practice mode, clicking on the Check button lets you check if the answer is correct
                if (mtxButtonPracticeCheck.hovering == true) {
                    mtxEvalResponse();
                    if (mtxVars.pracTrialCorr) {
                        document.getElementById('title_div').innerHTML = "Correct";
                        setTimeout(function() {
                            document.getElementById('title_div').innerHTML = "Click Next for the Next Trial";
                        }, 1500);
                    };
                };

                // In Practice mode, clicking on the Next button progresses to the next puzzle (3 in total)
                if (mtxButtonPracticeNext.hovering == true) {
                    mtxEvalResponse();
                    if (mtxVars.pracTrialCorr) {
                        for (var j = 0; j < 4; j++) {
                            imageBoxes[j].pressed = false;
                            imageBoxes[j].stroke = 0;
                        };
                        mtxVars.pracTrialImgIdx = mtxVars.pracTrialImgIdx + 5;
                        mtxVars.pracTrialIdx++;
                        if (mtxVars.pracTrialIdx == 3) {
                            mtxExpHandler.state = 3;
                            document.getElementById('title_div').innerHTML = "Main Experiment";
                        };
                        mtxVars.pracTrialCorr = false;    
                    } else {
                        document.getElementById('title_div').innerHTML = "Incorrect";
                        setTimeout(function() {
                            document.getElementById('title_div').innerHTML = "Try Another Choice";
                        }, 1500);
                    };
                };
                
            } else if (mtxExpHandler.state == 3) {
                if (mtxButtonAccept.hovering == true) {
                    mtxEvalResponse();
                    mtxVars.expTrialImgIdx = mtxVars.expTrialImgIdx + 5;
                    mtxVars.expTrialIdx++;
                    if (mtxVars.expTrialIdx == 20) {
                        mtxExpHandler.state = 4;
                        mtxVars.totScore = mtxVars.expResp.reduce((a, b) => a + b, 0);
                        let date = new Date;
                        let timeprint = `${ ("0" + (date.getDate())).slice(-2) }` + `${ ("0" + (date.getMonth() + 1)).slice(-2) }` + `${ date.getFullYear() }` + `${ ("0" + (date.getHours())).slice(-2) }` + `${ ("0" + (date.getMinutes())).slice(-2) }`;
                        taskresults.child(database_uid).child('mtx').child(timeprint).set({
                            'totalScore' : mtxVars.totScore,
                        }).catch(err => {
                            console.log(err.message);
                        });
                        allExpHandler.state += 1;
                        document.getElementById('mtx_div').style.display = 'none';
                        document.getElementById('controller_div').style.display = 'block';
                        audcog.mtx = false;
                        if (userID == 'debug') {
                            downloadMtxResult();
                        };
                    };
                    for (var j = 0; j < 4; j++) {
                        imageBoxes[j].pressed = false;
                        imageBoxes[j].stroke = 0;
                    };
                };
            };
        } else {
            document.getElementById('title_div').innerHTML = "Results";
        };
    };
}

// Create MTX Instance Mode
let mtx;
function createMTX() {
    mtx = new p5(mtx_s, 'mtx_div');
    mtxPrepareTrials(4, mtx);
}

let mtxButtonInstruct;
function mtxInstructions(p5instance) {
    let s = 'In this task, you will attempt puzzles\n\nYou will be shown an image with a missing piece\n\nYou have to find the missing piece from a few options\n\nYou have to choose one option from a list of four\n\n\n\nTry your best and guess when you are not sure!\n\nClick the button below to start the practice session';
    p5instance.fill(50);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width/2, p5instance.height/2 - 50);
    p5instance.textSize(25);
    p5instance.text('Next', p5instance.width/2 + 30, 750);
    mtxButtonInstruct.show(p5instance);
    mtxButtonInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    flashInstruct(flashInstructFadeRate, mtx);
}

function mtxPracticeInstructions(p5instance) {
    let s = 'In this practice session, you will attempt 3 puzzles\n\nThey will get harder as you go further\n\nAfter 30 seconds, you will automatically go to the next puzzle\n\nTry to complete the task within the time limit and guess if unsure!\n\n\nUse the buttons at the bottom to try this out';
    p5instance.fill(50);
    p5instance.textSize(30);
    p5instance.textFont('Georgia');
    p5instance.textAlign(p5instance.CENTER, p5instance.CENTER);
    p5instance.text(s, p5instance.width/2, p5instance.height/2 - 50);
    p5instance.textSize(25);
    p5instance.text('Start Practice', p5instance.width/2 + 30, 750);
    mtxButtonPracticeInstruct.show(p5instance);
    mtxButtonPracticeInstruct.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    mtxFlashInstruct(flashInstructFadeRate, mtx);
}

function mtxFlashInstruct(rate, p5instance) {
    p5instance.push();
    p5instance.fill(255, flashInstructAlpha);
    p5instance.noStroke();
    p5instance.rectMode(p5instance.CENTER);
    p5instance.rect(p5instance.width/2, p5instance.height/2, 1000, 800);
    flashInstructAlpha -= rate;
    p5instance.pop();
}

function mtxFlashPracticeInstruct(p5instance) {
    p5instance.push();
    p5instance.fill(255, flashPracticeInstructAlpha);
    p5instance.noStroke();
    p5instance.rectMode(p5instance.CENTER);
    p5instance.rect(p5instance.width/2, p5instance.height/2 - 100, 1000, 650);
    // flashPracticeInstructAlpha -= Math.pow(Math.E, 1/flashPracticeInstructAlpha);
    p5instance.stroke(0);
    p5instance.fill(0, 50, 200, 200);
    p5instance.triangle(265, 650, 255, 620, 275, 620);
    p5instance.triangle(450, 650, 440, 620, 460, 620);
    p5instance.triangle(650, 650, 640, 620, 660, 620);
    p5instance.pop();
}

function mtxPracticeTrial(p5instance) {
    mtxLoadTrial(mtx);
    p5instance.text('Check', p5instance.width/2 - 30, 750);
    mtxButtonPracticeCheck.show(p5instance);
    mtxButtonPracticeCheck.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    p5instance.textSize(25);
    p5instance.text('Next', p5instance.width/2 + 160, 750);
    mtxButtonPracticeNext.show(p5instance);
    mtxButtonPracticeNext.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    mtxFlashInstruct(flashInstructFadeRate, mtx);
    //flashPracticeInstruct();
}

function mtxMainExp(p5instance) {
    mtxLoadTrial(mtx);
    p5instance.textSize(25);
    p5instance.text('Accept Choice', p5instance.width/2 + 60, 750);
    mtxButtonAccept.show(p5instance);
    mtxButtonAccept.hover(p5instance.mouseX, p5instance.mouseY, p5instance);
    mtxFlashInstruct(flashInstructFadeRate, mtx);
}

function mtxLoadTrial(p5instance) {
    for (var i = 0; i < 4; i++) {
        imageBoxes[i].mouseisover(p5instance.mouseX, p5instance.mouseY, p5instance);
        imageBoxes[i].show(p5instance);
    };
    if (mtxExpHandler.state == 2) {
        p5instance.image(mtxVars.pracImgList[mtxVars.pracTrialImgIdx], p5instance.width/2, p5instance.height/4);
        p5instance.image(mtxVars.pracImgList[mtxVars.pracTrialImgIdx + 1], p5instance.width/2 - 300, p5instance.height - 200);
        p5instance.image(mtxVars.pracImgList[mtxVars.pracTrialImgIdx + 2], p5instance.width/2 - 100, p5instance.height - 200);
        p5instance.image(mtxVars.pracImgList[mtxVars.pracTrialImgIdx + 3], p5instance.width/2 + 100, p5instance.height - 200);
        p5instance.image(mtxVars.pracImgList[mtxVars.pracTrialImgIdx + 4], p5instance.width/2 + 300, p5instance.height - 200);
    } else if (mtxExpHandler.state == 3) {
        // Deals with Time Left for the Main Experiment and Displays this
        if (p5instance.frameCount % 60 == 0) {
            mtxVars.expTimeleft--;
        };
        if (mtxVars.expTimeleft <= 5) {
        p5instance.textSize(35);
        p5instance.text("Seconds left: " + mtxVars.expTimeleft, p5instance.width/2, p5instance.height/2 + 50)
        };
        //p5instance.textSize(35);
        //p5instance.text("Time Left: " + mtxVars.expTimeleft, p5instance.width/2, p5instance.height/2 + 50)

        // Progresses to the Next Trial when time runs out
        if (mtxVars.expTimeleft == 0) {
            mtxVars.expResp.push(0);
            mtxVars.expTrialImgIdx = mtxVars.expTrialImgIdx + 5;
            mtxVars.expTrialIdx++;
            mtxVars.expTimeleft = 30;
            if (mtxVars.expTrialIdx == 20) {
                mtxExpHandler.state = 4;
                mtxVars.totScore = mtxVars.expResp.reduce((a, b) => a + b, 0);
                let date = new Date;
                let timeprint = `${ ("0" + (date.getDate())).slice(-2) }` + `${ ("0" + (date.getMonth() + 1)).slice(-2) }` + `${ date.getFullYear() }` + `${ ("0" + (date.getHours())).slice(-2) }` + `${ ("0" + (date.getMinutes())).slice(-2) }`;
                taskresults.child(database_uid).child('mtx').child(timeprint).set({
                    'totalScore' : mtxVars.totScore,
                }).catch(err => {
                    console.log(err.message);
                });
                allExpHandler.state += 1;
                document.getElementById('mtx_div').style.display = 'none';
                document.getElementById('controller_div').style.display = 'block';
                audcog.mtx = false;
                if (userID == 'debug') {
                    downloadMtxResult();
                };
            };
        };

        p5instance.image(mtxVars.imgList[mtxVars.expTrialImgIdx], p5instance.width/2, p5instance.height/4);
        p5instance.image(mtxVars.imgList[mtxVars.expTrialImgIdx + 1], p5instance.width/2 - 300, p5instance.height - 200);
        p5instance.image(mtxVars.imgList[mtxVars.expTrialImgIdx + 2], p5instance.width/2 - 100, p5instance.height - 200);
        p5instance.image(mtxVars.imgList[mtxVars.expTrialImgIdx + 3], p5instance.width/2 + 100, p5instance.height - 200);
        p5instance.image(mtxVars.imgList[mtxVars.expTrialImgIdx + 4], p5instance.width/2 + 300, p5instance.height - 200);
    };
    flashInstruct(flashInstructFadeRate, mtx);
}

function mtxEvalResponse() {
    for (let i = 0; i < imageBoxes.length; i++) {
        if (imageBoxes[i].pressed == true) {
            if (mtxExpHandler.state == 2) {
                if (mtxVars.pracAns[mtxVars.pracTrialIdx] == i) {
                    console.log('Correct!');
                    mtxVars.pracTrialCorr = true;
                } else {
                    console.log('Incorrect!');
                    mtxVars.pracTrialCorr = false;
                    document.getElementById('title_div').innerHTML = "Incorrect";
                    setTimeout(function() {
                        document.getElementById('title_div').innerHTML = "Try Again";
                    }, 1500);
                };
            } else if (mtxExpHandler.state == 3) {
                if (mtxVars.imgOrder[mtxVars.expTrialIdx][i] == 1) {
                    mtxVars.expTimeleft = 30;
                    console.log('Correct!');
                    document.getElementById('title_div').innerHTML = "Correct";
                    setTimeout(function() {
                        document.getElementById('title_div').innerHTML = "Next Puzzle";
                    }, 1500);
                    mtxVars.expResp.push(1);
                } else {
                    mtxVars.expTimeleft = 30;
                    console.log('Incorrect!');
                    document.getElementById('title_div').innerHTML = "Incorrect";
                    setTimeout(function() {
                        document.getElementById('title_div').innerHTML = "Next Puzzle";
                    }, 1500);
                    mtxVars.expResp.push(0);
                };
            };
        };
    };
}

function downloadMtxResult() {
    var finishTime = new Date();
    var csv = 'Total Score\n';
    csv += mtxVars.totScore;
    csv += "\n";
    csv += "\n";
    csv += finishTime.toString() + "\n";

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'mtxResults.csv';
    hiddenElement.click();
}
