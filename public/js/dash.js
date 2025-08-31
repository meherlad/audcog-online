// Login to Firebase Database
let auth, database, taskresults;
let databaseUID;
let audcogData;
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('Dashboard DOM fully loaded and parsed');
    
    // Web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBVzYViFsrN67Eop8Z69jZv5T3Ps4VSJvk",
        authDomain: "auditory-cognition.firebaseapp.com",
        databaseURL: "https://auditory-cognition-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "auditory-cognition",
        storageBucket: "auditory-cognition.appspot.com",
        messagingSenderId: "617264139072",
        appId: "1:617264139072:web:b8f25f4294829a231708a5",
        measurementId: "G-06HW9GSL4Y"
        };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    database = firebase.database();
    taskresults = database.ref('audcog');

    // Authenticate with 'audcogncl' to obtain a snapshot of performance on all tasks
    auth = firebase.auth();
    auth.signInWithEmailAndPassword(email='audcogncl@test.com', password='12345678').then(cred => {
        databaseUID = auth.getUid();
        taskresults.child(databaseUID).get().then((snapshot) => {
            if (snapshot.exists()) {
                audcogData = snapshot.val();
                exampleDashboard();
            } else {
                console.log("No data available");
            }
        }, function (error) {
            console.log("Error: " + error.code);
        });
    
    }).catch(err => {
        console.log(err.message);
        document.getElementById('error_message').innerHTML = err.message;
    });
});

function exampleDashboard() {
    document.getElementById('totAttempts').innerHTML = 'The total number of attempts is ' + audcogData.visits;
    plotAgeHist();
    plotDiscThres();
    plotAWMPrec();
}

let ageData;
function plotAgeHist() {
    ageData = [];
    for (let key in audcogData.misc) {
        ageData.push(audcogData.misc[key].age);
    }

    const trace1 = {
        x: ageData,
        type: 'histogram',
        histnorm: 'probability',
        name: 'Age Distribution',
        opacity: 0.5
    };

    let data1 = [trace1];

    let layout1 = {
        showlegend: false,
        title: 'Age Distribution',
        xaxis: {
            title: 'Age'
        },
        yaxis: {
            title: 'Probability'
        },
        barmode: "overlay"
    };
    Plotly.newPlot('chartAgeHist', data1, layout1);
}

// Calculates threshold for task based on inputted last number of reversals
function calcThreshold(array, number) {
    let revsAll = [];
    for (let x=1; x<array.length-1; x++) {
        if (((array[x-1] > array[x]) && (array[x+1] > array[x])) || ((array[x-1] < array[x]) && (array[x+1] < array[x]))) {
            revsAll.push(array[x]);
        };
    }
    
    let revs = [];
    for (let x=-number;x<0;x++) {
        revs.push(revsAll[revsAll.length + x]);
    };
    return (revs.reduce((a, b) => a + b, 0) / revs.length);
}

let dinThresData, sibThresData, sfgThresData;
function plotDiscThres() {
    dinThresData = [];
    for (let key in audcogData.din) {
        dinThresData.push(calcThreshold(audcogData.din[key].dinTrialdBs, 5) + 10);
    }

    var data1 = [
        {
          x: ageData,
          y: dinThresData,
          mode: 'markers',
          type: 'scatter'
        }
    ];

    layout1 = {
        showlegend: false,
        title: 'Digits-in-Noise',
        xaxis: {
            title: 'Age'
        },
        yaxis: {
            title: 'TMR (dB)'
        }
    };

    Plotly.newPlot('chartAgeDin', data1, layout1);

    sibThresData = [];
    for (let key in audcogData.sib) {
        sibThresData.push(calcThreshold(audcogData.sib[key].sibTrialdBVols, 5));
    }

    var data2 = [
        {
          x: ageData,
          y: sibThresData,
          mode: 'markers',
          type: 'scatter'
        }
    ];

    layout2 = {
        showlegend: false,
        title: 'Speech-in-Babble',
        xaxis: {
            title: 'Age'
        },
        yaxis: {
            title: 'TMR (dB)'
        }
    };

    Plotly.newPlot('chartAgeSib', data2, layout2);

    sfgThresData = [];
    for (let key in audcogData.sfg) {
        sfgThresData.push(calcThreshold(audcogData.sfg[key].sfg_trial_vols, 5));
    }

    var data3 = [
        {
          x: ageData,
          y: sfgThresData,
          mode: 'markers',
          type: 'scatter'
        }
    ];

    layout3 = {
        showlegend: false,
        title: 'Stochastic Figure Ground',
        xaxis: {
            title: 'Age'
        },
        yaxis: {
            title: 'TMR (dB)'
        }
    };

    Plotly.newPlot('chartAgeSfg', data3, layout3);
}

let freqPrecData, amPrecData;
function plotAWMPrec() {
    
}
