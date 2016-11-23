var db_address = "http://128.30.25.154:5984/atr-login";
var db;
var uid;
var testString;
var uidToKerberos;
var username = "None";

var tapingTestObject = {
    'Taping': ['Ankle', 'Elbow/wrist', 'Foot/toe', 'Hand/finger', 'Hip', 'Knee', 'Shoulder'],
    "Active Warmup": ["Bike", "Treadmill", "UBE", "Elliptical"],
    "Time with Athletic Trainer": ['Consultation', 'Evaluation', 'Re-evaluation', 'Gait training', 'HEP (Designed)']
};

function init() {
    categoryButtons = document.getElementById('button-list');
    activitiesButtons = document.getElementById('activities-list');
    selectedList = document.getElementById('selected-list');

    testString = document.getElementById("test");
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
