import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


const AWS = require('aws-sdk')
const s3 = new AWS.S3()


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log(todoId);

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const params = {Bucket: process.env.BUCKET_NAME, Key: todoId, Expires: 360};
const url = s3.getSignedUrl('putObject', params);
console.log('The URL is', url); // expires in 60 seconds
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({uploadUrl:url})
  }
}
