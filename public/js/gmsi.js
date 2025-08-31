// The questionnaire

let GMSI, headings, AE_01, AE_02, AE_03, AE_04, AE_05, AE_06, AE_07, AE_08, AE_09, EM_01, EM_02, EM_03, EM_04, EM_05, EM_06, MT_01, MT_02, MT_03, MT_04, MT_05, MT_06, MT_07, PA_01, PA_02, PA_03, PA_04, PA_05, PA_06, PA_07, PA_08, PA_09, SA_01, SA_02, SA_03, SA_04, SA_05, SA_06, SA_07, AP_01;

let questionnaire_alert = document.getElementById('question_alert');

headings = ['MID', 'Item', 'Response', 'Negative'];
choices = ['1 - Completely Disagree', '2 - Strongly Disagree', '3 - Disagree', '4 - Neither Agree nor Disagree', '5 - Agree', '6 - Strongly Agree', '7 - Completely Agree'];

AE_01 = ['I spend a lot of my free time doing music-related activities', choices, false];
AE_02 = ["I enjoy writing about music, for example on blogs and forums", choices, false];
AE_03 = ["I'm intrigued by musical styles I'm not familiar with and want to find out more", choices, false];
AE_04 = ["I have attended ___ live music events as an audience member in the past twelve months", ['0', '1', '2', '3', '4-6', '7-10', '11 or more'], false];
AE_05 = ['I often read or search the internet for things related to music', choices, false];
AE_06 = ["I don't spend much of my disposable income on music", choices, true];
AE_07 = ['Music is kind of an addiction for me - I couldnt live without it', choices, false];
AE_08 = ['I listen attentively to music for ___ per day', ['0-15 min', '15-30 min', '30-60 min', '60-90 min', '2hrs', '2-3 hrs', '4 hrs or more'], false];
AE_09 = ['I keep track of new music that I come across (e.g. new artists or recordings)', choices, false];
EM_01 = ['I sometimes choose music that can trigger shivers down my spine', choices, false];
EM_02 = ['Pieces of music rarely evoke emotions for me', choices, true];
EM_03 = ['I often pick certain music to motivate or excite me', choices, false];
EM_04 = ['I am able to identify what is special about a given musical piece', choices, false];
EM_05 = ['I am able to talk about the emotions that a piece of music evokes for me', choices, false];
EM_06 = ['Music can evoke my memories of past people and places', choices, false];
MT_01 = ["I engaged in regular, daily practice of a musical instrument (including voice) for_ years", ['0', '1', '2', '3', '4-5', '6-9', '10 or more'], false];
MT_02 = ["At the peak of my interest, I practised my primary instrument for ___ hours per day", ['0', '0.5', '1', '1.5', '2', '3-4', '5 or more'], false];
MT_03 = ['I have never been complimented for my talents as a musical performer', choices, true];
MT_04 = ['I have had formal training in music theory for ___ years', ['0', '0.5', '1', '2', '3', '4-6', '7 or more'], false];
MT_05 = ['I have had ___ years of formal training on a musical instrument (including voice) during my lifetime', ['0', '0.5', '1', '2', '3-5', '6-9', '10 or more'], false];
MT_06 = ['I can play ___ musical instruments', ['0', '1', '2', '3', '4', '5', '6 or more'], false];
MT_07 = ['I would not consider myself a musician', choices, true];
PA_01 = ['I am able to judge whether someone is a good singer or not', choices, false];
PA_02 = ["I usually know when I'm hearing a song for the first time", choices, false];
PA_03 = ['I find it difficult to spot mistakes in a performance of a song even if I know the tune', choices, true];
PA_04 = ['I can compare and discuss differences between two performances or versions of the same piece of music', choices, false];
PA_05 = ['I have trouble recognizing a familiar song when played in a different way or by a different performer', choices, true];
PA_06 = ['I can tell when people sing or play out of time with the beat', choices, false];
PA_07 = ['I can tell when people sing or play out of tune', choices, false];
PA_08 = ["When I sing, I have no idea whether I'm in tune or not", choices, false];
PA_09 = ["When I hear a piece of music I can usually identify its genre", choices, false];
SA_01 = ["If somebody starts singing a song I don't know, I can usually join in", choices, false];
SA_02 = ['I can sing or play music from memory', choices, false];
SA_03 = ['I am able to hit the right notes when I sing along with a recording', choices, false];
SA_04 = ['I am not able to sing in harmony when somebody is singing a familiar tune', choices, true];
SA_05 = ['I dont like singing in public because Im afraid that I would sing wrong notes', choices, true];
SA_06 = ["After hearing a new song two or three times, I can usually sing it by myself", choices, false];
SA_07 = ["I only need to hear a new tune once and I can sing it back hours later", choices, false];
AP_01 = ["Do you have absolute pitch? Absolute or perfect pitch is the ability to recognise and name an isolated musical tone without a reference tone, e.g. being able to say 'F#' if someone plays that note on the piano", ["Yes", "No"], false];

GMSI = {
    'headings': headings,
    1: AE_01,
    2: AE_02,
    3: AE_03,
    4: AE_04,
    5: AE_05,
    6: AE_06,
    7: AE_07,
    8: AE_08,
    9: AE_09,
    10: EM_01,
    11: EM_02,
    12: EM_03,
    13: EM_04,
    14: EM_05,
    15: EM_06,
    16: MT_01,
    17: MT_02,
    18: MT_03,
    19: MT_04,
    20: MT_05,
    21: MT_06,
    22: MT_07,
    23: PA_01,
    24: PA_02,
    25: PA_03,
    26: PA_04,
    27: PA_05,
    28: PA_06,
    29: PA_07,
    30: PA_08,
    31: PA_09,
    32: SA_01,
    33: SA_02,
    34: SA_03,
    35: SA_04,
    36: SA_05,
    37: SA_06,
    38: SA_07,
    39: AP_01,
    responses: []
}

let question_counter = 1;
let survey_response = 0;

// Displays the next question in the questionnaire
function loadGMSIQuestion() {
    GMSI.progress = (((question_counter) / 39) * 100)
    document.getElementById('progressBar').style.width = GMSI.progress.toString() + '%';

    if (audcog.gmsi) {
        document.getElementById('gmsi_question').innerHTML = GMSI[question_counter][0];
        document.getElementById('btn_choice_1').innerHTML = GMSI[question_counter][1][0];
        document.getElementById('btn_choice_2').innerHTML = GMSI[question_counter][1][1];
        if (question_counter != 39) {
            document.getElementById('btn_choice_3').innerHTML = GMSI[question_counter][1][2];
            document.getElementById('btn_choice_4').innerHTML = GMSI[question_counter][1][3];
            document.getElementById('btn_choice_5').innerHTML = GMSI[question_counter][1][4];
            document.getElementById('btn_choice_6').innerHTML = GMSI[question_counter][1][5];
            document.getElementById('btn_choice_7').innerHTML = GMSI[question_counter][1][6];
        } else {
            document.getElementById('btn_choice_3').style.display = 'none';
            document.getElementById('btn_choice_4').style.display = 'none';
            document.getElementById('btn_choice_5').style.display = 'none';
            document.getElementById('btn_choice_6').style.display = 'none';
            document.getElementById('btn_choice_7').style.display = 'none';
        };
        survey_response = 0;
    }
}

// Collects response on button 1 click and removes alert message if this had appeared
document.getElementById('btn_choice_1').addEventListener('click', function () {
    survey_response = 1;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 2 click and removes alert message if this had appeared
document.getElementById('btn_choice_2').addEventListener('click', function () {
    survey_response = 2;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 3 click and removes alert message if this had appeared
document.getElementById('btn_choice_3').addEventListener('click', function () {
    survey_response = 3;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 4 click and removes alert message if this had appeared
document.getElementById('btn_choice_4').addEventListener('click', function () {
    survey_response = 4;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 5 click and removes alert message if this had appeared
document.getElementById('btn_choice_5').addEventListener('click', function () {
    survey_response = 5;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 6 click and removes alert message if this had appeared
document.getElementById('btn_choice_6').addEventListener('click', function () {
    survey_response = 6;
    questionnaire_alert.innerHTML = '';
});

// Collects response on button 7 click and removes alert message if this had appeared
document.getElementById('btn_choice_7').addEventListener('click', function () {
    survey_response = 7;
    questionnaire_alert.innerHTML = '';
});

// Next Button on the Questionnaire Page closes the survey_div and Opens the task_div Div
document.getElementById('gmsinextbutton').addEventListener('click', function () {

    if (survey_response == 0) {
        // Get an alert message asking participant to choose a response before pressing NEXT
        questionnaire_alert.innerHTML = 'Please choose a response before pressing the NEXT button';

    } else {
        // Store response to question
        GMSI.responses.push(survey_response)
        question_counter++;

        if (question_counter % 14 == 0) {
            allExpHandler.state += 1;
            document.getElementById('gmsi_div').style.display = 'none';
            document.getElementById('controller_div').style.display = 'block';
            audcog.gmsi = false;
        } else if (question_counter > 39) {
            let date = new Date;
            let timeprint = `${("0" + (date.getDate())).slice(-2)}` + `${("0" + (date.getMonth() + 1)).slice(-2)}` + `${date.getFullYear()}` + `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`;

            taskresults.child(userID).child('gmsi').child(timeprint).set({
                'GMSI responses': GMSI.responses,
            }).catch(err => {
                console.log(err.message);
            });
            allExpHandler.state += 1;
            document.getElementById('gmsi_div').style.display = 'none';
            document.getElementById('controller_div').style.display = 'block';
            audcog.gmsi = false;
        } else {
            // Next question is loaded
            loadGMSIQuestion();
        };
    };
}); 