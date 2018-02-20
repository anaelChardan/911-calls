var mongodb = require('mongodb');
var csv = require('csv-parser');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/911-calls';



var insertCalls = function(db, callback) {
    var collection = db.collection('calls');

    var calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => {
            // On prend pas la description et le e car useless
            const { lat: latitude, lng: longitude, zip: zipCode, title, timeStamp: date, twp : neighbourhood, addr: address } = data;

            const delimiterIndex = title.indexOf(':');
            const category = title.substring(0, delimiterIndex);
            
            const event = title.substring(delimiterIndex + 1, title.length).trim();

            var call = {
                coordinates : [parseFloat(latitude), parseFloat(longitude)],
                zipCode,
                category,
                event,
                date,
                neighbourhood,
                address
            };

            calls.push(call);
        })
        .on('end', () => {
          collection.insertMany(calls, (err, result) => {
            callback(result)
          });
        });
}

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        db.close();
    });
});
