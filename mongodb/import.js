const mongodb = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://localhost:27017/911-calls';

const transformData = data => {
    // We're not taking desc and e fields as they're useless
    const { lat: latitude, lng: longitude, zip: zipCode, title, timeStamp: date, twp: neighbourhood, addr: address } = data;

    const delimiterIndex = title.indexOf(':');

    const category = title.substring(0, delimiterIndex);
    const event = title.substring(delimiterIndex + 1, title.length).trim();

    return {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        zipCode,
        category,
        event,
        date: new Date(date),
        neighbourhood,
        address
    };
}

const insertCalls = (db, callback) => {
    const collection = db.collection('calls');

    const calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => calls.push(transformData(data)))
        .on('end', () => {
            collection.insertMany(calls, (err, result) => {
                if (err) console.log(err)
                else callback(result)
            });
        });
}

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        db.close();
    });
});
