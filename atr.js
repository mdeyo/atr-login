var db_address = "http://128.30.25.154:5984/atr-login";
var db;
var uid;
var testString;
var uidToKerberos;

var tapingTestObject = {
    'Taping': ['Ankle', 'Elbow/wrist', 'Foot/toe', 'Hand/finger', 'Hip', 'Knee', 'Shoulder'],
    "Active Warmup": ["Bike", "Treadmill", "UBE", "Elliptical"]
};

function init() {
    activitiesButtons = document.getElementById('button-list');
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
        testString.innerHTML = "Welcome " + uidToKerberos[idString] + "<br/> " + idString;
    } else {
        testString.innerHTML = "Uknown ID <br/>  " + idString;
    }
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

var activitiesButtons, selectedList;

function initializeButtons() {
    activitiesButtons.innerHTML = "";
    var newActivityButton;
    for (i in tapingTestObject) {
        newActivityButton = null;
        newActivityButton = document.createElement("button");
        newActivityButton.innerHTML = i;
        newActivityButton.className += "myButton";
        newActivityButton.addEventListener("click", function() {
            updateActivityButtons(this.innerHTML);
        });
        activitiesButtons.appendChild(newActivityButton);
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
        newActivityButton.className += "myButton";
        newActivityButton.addEventListener("click", function() {
            addActivityToLogin(this.message);
        });
        activitiesButtons.appendChild(newActivityButton);
    }
}

function addActivityToLogin(activity) {
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


function clickOnSelectedActivity(button) {
    console.log(button);
    if (confirm('Are you sure you want to remove ' + button.innerHTML + '?')) {
        // Save it!
        button.parentNode.removeChild(button);
    } else {
        // Do nothing!
    }

}
