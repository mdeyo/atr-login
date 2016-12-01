var db_address = "http://128.30.25.154:5984/atr-login";
var db;
var uid;
var testString;
var uidToKerberos;
var username = "None";
var arrowIcon, submitButton, selectedTitle;

var tapingTestObject = {
    'Taping': ['Ankle', 'Elbow/wrist', 'Foot/toe', 'Hand/finger', 'Hip', 'Knee', 'Shoulder'],
    "Ice and Compression": ['Ice Bag/Ice Massage', 'Cold whirlpool', 'Compression Pump (Normatec)', 'Compression Sleeve', 'Game ready'],
    "Time with Athletic Trainer": ['Consultation', 'Evaluation', 'Re-evaluation', 'Gait training', 'HEP (Designed)'],
    "Active Warmup": ["Bike", "Treadmill", "UBE", "Elliptical"],
    "Stretching": ['Back', "Lower Leg", 'Elbow/wrist', 'Hip/thigh', 'Shoulder'],
    "Exercises": ['Therapeutic Exercise', 'Aquatic Therapeutic Exercise', 'Foam Roller / Stick Roller', 'Foor Roler / Golf Ball'],
    "Pyhsical Therapy": ['Physical Therapy Evaluation', 'Joint Mobilization', 'Manual Therapy', 'Massage / Myofascial Release', 'Moist Heat Pack', 'Neuromuscular re-education'],
    "Equipment Issued": ['Crutches', 'Splint/Brace', 'Boot'],
    "Medical Treatment": ['Traction (Mechanical)', 'Wound Care', 'Burn Care', 'Medication', 'Debridement'],
    "Special Equipment": ['Ultrasound', 'Phonophoresis', 'Electrical Stimulation'],
    "Testing": ['Functional screening', 'imPACT testing', 'Pyhsical Performance Test'],
    "Others": ["Mob self (Roll,Stick,Ball)", 'Mob soft tissue instrument', 'Padding', 'ROM - Lower Extremity', 'ROM - Upper Extremity']
};

function init() {
    categoryButtons = document.getElementById('button-list');
    activitiesButtons = document.getElementById('activities-list');
    selectedList = document.getElementById('selected-list');
    arrowIcon = document.getElementById('arrow-icon');
    submitButton = document.getElementById('submit-button');
    selectedTitle = document.getElementById('selected-title');

    selectedTitle.style.display = "none";
    selectedList.style.display = "none";

    testString = document.getElementById("title-text");
    db = new PouchDB(db_address);
    console.log(db);
    db.get('uid-to-kerberos map').then(function(doc) {
        console.log(doc);
        uidToKerberos = doc;
        startChangeListener();
    }).catch(function(err) {
        console.log(err);
    });
    initializeButtons();
}

//// listen for changes to the database ////
function startChangeListener() {
    console.log("started change listener");

    db.changes({
        since: 'now',
        live: true,
        include_docs: true
    }).on('change', function(change) {
        console.log(change);
        if (change.deleted) {
            // document was deleted - nothing important
        } else {
            if (change.doc._id == "current_id") {
                uid = change.doc.uid;
                console.log("uid: " + uid.toString());
                showUid(uid.toString());
            } else if (change.doc._id == "uid-to-kerberos map") {
                uidToKerberos = change.doc;
                showUid(uid.toString());
            }
        }
    }).on('error', function(err) {
        console.log(err)
        setTimeout(function() {
            startChangeListener();
        }, 2000);
        console.log("Error thrown, waiting for 2 secs to restart")
    });
}
/////////////////////////////////////////////

function showUid(idString) {
    if (uidToKerberos[idString]) {
        username = uidToKerberos[idString];
        testString.innerHTML = "Welcome " + username + "<br/> " + idString;
        showButtons();
    } else {
        testString.innerHTML = "Unknown ID <br/>  " + idString;
        showRegister();
    }
}

function simScan() {
    showButtons();
}

function showRegister() {
    var username = prompt("Please enter your kerberos username:");
    setUidToKerberos(username);
}

function showButtons() {
    document.getElementById('coverup').style.display = 'none';
}

function hideButtons() {
    document.getElementById('coverup').style.display = 'block';
}

function setUidToKerberos(username) {
    db.get('uid-to-kerberos map').then(function(doc) {
        doc[uid.toString()] = username;
        uidToKerberos = doc;
        db.put(doc).then(function(response) {
            // handle response
            console.log('updated db with new username');
        }).catch(function(err) {
            console.log(err);
        });
    }).catch(function(err) {
        console.log(err);
    });
}

var categoryButtons, activitiesButtons, selectedList;

function initializeButtons() {
    categoryButtons.innerHTML = "";
    var newActivityButton;
    for (i in tapingTestObject) {
        newActivityButton = null;
        newActivityButton = document.createElement("button");
        newActivityButton.innerHTML = i;
        newActivityButton.className += "myButton categoryButton";
        newActivityButton.addEventListener("click", function() {
            updateActivityButtons(this.innerHTML);
        });
        categoryButtons.appendChild(newActivityButton);
    }
}

function updateActivityButtons(category) {
    console.log(category);
    activitiesButtons.innerHTML = "";
    var newActivityButton;
    for (i in tapingTestObject[category]) {
        newActivityButton = document.createElement("button");
        newActivityButton.innerHTML = tapingTestObject[category][i];
        newActivityButton.message = category + " - " + tapingTestObject[category][i];
        newActivityButton.className += "myButton activityButton";
        newActivityButton.addEventListener("click", function() {
            addActivityToLogin(this.message);
        });
        activitiesButtons.appendChild(newActivityButton);
    }
}

function addActivityToLogin(activity) {
    if (noRepition(activity)) {
        console.log("added " + activity);
        initializeButtons()
        var newActivityButton = document.createElement("button");
        newActivityButton.innerHTML = activity;
        newActivityButton.className += "myButton";
        newActivityButton.addEventListener("click", function() {
            console.log("clicked on " + activity);
            clickOnSelectedActivity(this);
        });
        selectedList.appendChild(newActivityButton);

        arrowIcon.style.display = "block";
        submitButton.style.display = "block";
        selectedTitle.style.display = "block";
        selectedList.style.display = "block";
    }
}


function clickOnSelectedActivity(button) {
    console.log(button);
    if (confirm('Are you sure you want to remove ' + button.innerHTML + '?')) {
        // Save it!
        button.parentNode.removeChild(button);
    } else {
        // Do nothing!
    }
}

function noRepition(name) {
    var value = true;
    for (i in selectedList.children) {
        selection = selectedList.children[i];
        if (typeof(selection) == "object") {
            if (selection.innerHTML == name) {
                value = false;
                break;
            }
        }
    }
    return value;
}

function submitActivities() {
    var newLoginObj = {};
    var selection;
    var message = "user: " + username + ", activities: ";
    var selectedArray = [];
    for (i in selectedList.children) {
        selection = selectedList.children[i];
        if (typeof(selection) == "object") {
            console.log(selection.innerHTML);
            selectedArray.push(selection.innerHTML);
        }
    }
    var d = new Date();
    var timestamp = d.toLocaleString();
    newLoginObj['_id'] = timestamp + " - " + username;
    newLoginObj.username = username;
    newLoginObj.timestamp = timestamp;
    newLoginObj.activities = selectedArray;
    console.log(message + selectedArray.toString());

    db.put(newLoginObj).then(function(response) {
        // handle response
        console.log('saved doc!');
        alert(message + selectedArray.toString());
        selectedList.innerHTML = "";
        hideButtons();
    }).catch(function(err) {
        console.log(err);
    });
}
