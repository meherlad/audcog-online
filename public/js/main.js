//  Main file - Web App Login Page
// 
//  1. Login via Google Firebase API
//  2. Global variables declared (e.g. time, etc)
//  3. Task workflow determined depending on user ID
//

// Login to Firebase Database
let auth, userID, database, taskresults;
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    // Browser and device checks
    const isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
    const isSuitable = true; //(window.innerWidth > 400) && (window.innerHeight > 200)

    // Basic audio capability check
    const hasAudioSupport = !!(window.AudioContext || window.webkitAudioContext);
    if (!hasAudioSupport) {
        try {
            document.getElementById('login_div').style.display = 'none';
            const errDiv = document.getElementById('browser_device_error');
            errDiv.style.display = 'block';
            errDiv.innerHTML = "<p>Your browser does not support required Web Audio features.</p><p>Please update your browser or use the latest Chrome/Edge/Firefox.</p>";
        } catch (e) {}
        return;
    }

    // Doesn't have to be Chrome for the time being
    if (isSuitable) {

        userID = getUserIDFromQueryString();
        if (!userID) { // Check if userID is null or empty
            document.getElementById('login_div').style.display = 'none';
            document.getElementById('id_error').style.display = 'block';
        }
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyDPTy_twUrqEXlVfpALoqYkPdcux7klcEQ",
            authDomain: "audcog-online.firebaseapp.com",
            databaseURL: "https://audcog-online-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "audcog-online",
            storageBucket: "audcog-online.appspot.com",
            messagingSenderId: "652871235053",
            appId: "1:652871235053:web:7776007488c3ccf30163e4",
            measurementId: "G-PCY56CPWHB"
        };
        // Initialize Firebase (guard against re-init)
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
            }
        } catch (e) {
            // ignore if already initialized
        }
        try { if (firebase.analytics) { firebase.analytics(); } } catch (e) {}
        database = firebase.database();
        taskresults = database.ref('audcog-online');
        auth = firebase.auth();

    } else {
        login_div.style.display = 'none';
        browser_device_error_div.style.display = 'block';
    };
});

// Get date and specify it in a particular format DDMMYYYYHHMM
let date = new Date;

let timings = {
    expStartTime: `${("0" + (date.getHours())).slice(-2)}` + `${("0" + (date.getMinutes())).slice(-2)}`,
    expFinishTime: 0,
    sibStartTime: 0,
    sibFinishTime: 0,
    dinStartTime: 0,
    dinFinishTime: 0,
    sfgStartTime: 0,
    sfgFinishTime: 0,
    awmStartTime: 0,
    awmFinishTime: 0,
};

// Authenticate User and Create global variables needed to store in Database
let database_uid, allVisits, userVisits;

// Function to extract userID from the query string
function getUserIDFromQueryString() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userID');
}

document.getElementById('submitbutton').addEventListener('click', async function () {
    console.log('[AudCog] START clicked with userID=', userID);
    // Proactively unlock/resume audio, request fullscreen, orientation, and wake lock for better compatibility
    try {
        if (window.AudcogUtils) {
            await AudcogUtils.unlockAudio();
            await AudcogUtils.requestFullscreenSafely();
            AudcogUtils.lockOrientation('landscape');
            AudcogUtils.requestWakeLock();
            AudcogUtils.setTaskActive(true);
        } else {
            openFullscreen();
        }
    } catch (e) {}

    // UserID is appended to a dummy email address that is needed to access Firebase Auth details
    if (userID != '') {
        auth.signInAnonymously().then(cred => {
            document.getElementById('login_div').style.display = 'none';
            document.getElementById('audcog_header').style.display = 'none';
            document.body.style.margin = "0px";
            document.getElementById('error_message').innerHTML = "";
            database_uid = auth.getUid();
            console.log('[AudCog] Signed in anonymously. uid=', database_uid);
            createTaskWorkflow(userID);

            // Load global visit counters (optional)
            taskresults.child('visits').once("value", function (snapshot) {
                allVisits = snapshot.val();
                console.log('[AudCog] Global visits snapshot =', allVisits);
            }, function (error) {
                console.log("[AudCog] Error reading visits:", error.code);
            });

            // Checks if the user has done a task previously
            taskresults.child(userID).child('sessions').once("value", function (snapshot) {
                if (snapshot.val() < 1) {
                    taskresults.child(userID).child('sessions').set(0);
                    userVisits = 0;
                } else {
                    userVisits = snapshot.val();
                };
                console.log('[AudCog] sessions for user =', userVisits);
            }, function (error) {
                console.log("[AudCog] Error reading sessions:", error.code);
            });

            // Build resume order before creating the controller
            taskresults.child(userID).get().then(userSnap => {
                try {
                    if (userSnap && userSnap.exists()) {
                        const v = userSnap.val() || {};
                        const keys = Object.keys(v);
                        const hasAll = !!(v.din && v.sib && v.awm && v.gmsi && (v.misc || v.timings));
                        console.log('[AudCog] User snapshot keys =', keys, 'hasAll=', hasAll);
                        if (hasAll) {
                            window.__completedAll = true;
                            window.__resumeOrder = [];
                            console.log('[AudCog] Marked completedAll -> true');
                            return; // done
                        }
                        if (typeof window.buildResumeOrderFromDb === 'function') {
                            const hasProgress = !!(v.din || v.sib || v.awm || v.gmsi || v.misc || v.timings);
                            console.log('[AudCog] hasProgress=', hasProgress);
                            if (hasProgress) {
                                window.__resumeOrder = window.buildResumeOrderFromDb(userSnap);
                                console.log('[AudCog] Computed resumeOrder =', window.__resumeOrder, 'completedAll=', window.__completedAll);
                            } else {
                                window.__resumeOrder = undefined;
                                window.__completedAll = false;
                                console.log('[AudCog] No prior progress detected; starting fresh');
                            }
                        }
                    } else {
                        console.log('[AudCog] No user snapshot found; starting fresh');
                    }
                } catch (e) {
                    console.log('[AudCog] Error building resume order:', e);
                    window.__resumeOrder = undefined;
                }
            }).finally(() => {
                console.log('[AudCog] Creating controller. completedAll=', window.__completedAll, 'resumeOrder=', window.__resumeOrder);
                createController();
            });

        }).catch(err => {
            console.log('[AudCog] Auth error:', err.message);
            document.getElementById('error_message').innerHTML = err.message;
        });
    };
});

// Organise task workflow - pick and choose different tasks according to login
let debug;
function createTaskWorkflow(userID) {
    if (userID == 'debug') {
        debug = true;
        document.getElementById('controller_div').style.display = 'block';
    } else if (userID == 'demo') {
        debug = false;
        document.getElementById('controller_div').style.display = 'block';
    } else if (userID == 'audcogncl') {
        debug = false;
        document.getElementById('controller_div').style.display = 'block';
    } else {
        debug = false;
        document.getElementById('controller_div').style.display = 'block';
    };
}

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}