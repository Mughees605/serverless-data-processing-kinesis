'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const errorString = 'error';

exports.handler = function(event, context, callback) {
  console.log('Number of Records sent for each invocation of Lambda function = ', event.Records.length)
  const requestItems = buildRequestItems(event.Records);
  const requests = buildRequests(requestItems);

  Promise.all(requests)
    .then(() => callback(null, `Delivered ${event.Records.length} records`))
    .catch(callback);
};

function buildRequestItems(records) {
  let sequenceNumber = 0;
  try {
    return records.map((record) => {
      sequenceNumber = record.kinesis.sequenceNumber;
      console.log('Processing record with Sequence Number = ', sequenceNumber);
      const json = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
      const item = JSON.parse(json);

      if(item.InputData.toLowerCase().includes(errorString)) {
        console.log ('Error record is = ', item);
        throw new Error('kaboom')
      }

      return {
        PutRequest: {
          Item: item,
        },
      };
    });
  }catch (err) {
      console.log('Returning Failure Sequence Number =', sequenceNumber)
      return { "batchItemFailures": [ {"itemIdentifier": sequenceNumber} ] }
    }
}

function buildRequests(requestItems) {
  const requests = [];

  while (requestItems.length > 0) {
    const request = batchWrite(requestItems.splice(0, 25));

    requests.push(request);
  }

  return requests;
}

function batchWrite(requestItems, attempt = 0) {
  const params = {
    RequestItems: {
      [tableName]: requestItems,
    },
  };

  let delay = 0;

  if (attempt > 0) {
    delay = 50 * Math.pow(2, attempt);
  }

  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      dynamoDB.batchWrite(params).promise()
        .then(function(data) {
          if (data.UnprocessedItems.hasOwnProperty(tableName)) {
            return batchWrite(data.UnprocessedItems[tableName], attempt + 1);
          }
        })
        .then(resolve)
        .catch(reject);
    }, delay);
  });
}