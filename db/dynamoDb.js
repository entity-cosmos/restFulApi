const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: "http://localhost:8000",
    region: "ap-southwest-1",
  });
  
module.exports = dynamodb