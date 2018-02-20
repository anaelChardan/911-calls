var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

const esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error',
  requestTimeout: 60000 
});


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

const createBulkQuery = chunks => {
  const body = chunks.reduce((acc, chunk) => {
    acc.push({ index: { _index: '911', _type: 'call' } });
    acc.push(chunk);
    return acc;
  }, []);

  return { body };
}

const calls = [];

fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => calls.push(transformData(data)))
    .on('end', () => {
      esClient.bulk(createBulkQuery(calls), (err, resp) => {
          if(err) console.error(err)
          else console.log(`Inserted ${resp.items.length} elements`);
          esClient.close();
      });
    }
  );
