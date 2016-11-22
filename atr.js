var db_address = "http://19.125.84.126:5984/atr-login";
var db = new PouchDB(db_address);

//// listen for changes to the database ////
function startChangeListener() {
    console.log("started change listener");

    db.changes({
        since: 'now',
        live: true,
        include_docs: true
    }).on('change', function(change) {
        if (change.deleted) {
            // document was deleted - nothing important
        } else {
            if (change.doc.type == "route") {
                var mes = change.doc.message;
                // var id = change.id;
                // console.log("id: "+id);
                // var user_id = id.split("user:")[1];
                console.log("route added/modified - updated " + change.id);
                // console.log("message " + mes);
                // console.log("for the user: " + user_id);
                // console.log("my user id: " + loginInfo.uid);

                if (loginInfo.uid == change.id.split("user:")[1]) {
                    if (mes == "assigned") {
                        console.log("driver assigned");

                    } else if (mes == "arrival") {
                        console.log("driver arrived");
                        driverArrivedEvent();

                    } else if (mes == "pickup") {
                        console.log("driver picked up");

                    } else if (mes == "dropoff") {
                        console.log("driver dropped up");
                        passengerDropoffEvent();

                    }
                }
            } else if (change.id == "white" || change.id == "white_latlon" ||
                change.id == "red" || change.id == "red_latlon" ||
                change.id == "blue" || change.id == "blue_latlon") {
                console.log("updated " + change.id + " vehicle");
                console.log(change.doc);
                updateVehicleIconPosition(change.doc);
            } else {
                console.log("other update: " + change.id + " vehicle");
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
