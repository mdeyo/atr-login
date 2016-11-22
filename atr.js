var db_address = "http://128.30.25.154:5984/atr-login";
var db;
var uid;
var testString;
var uidToKerberos;

function init() {
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
