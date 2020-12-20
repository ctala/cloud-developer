import 'source-map-support/register'
import { getDocClient } from '../../utils/dynamodb'
import { getUser } from '../../utils/user'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


//Variables
const docClient = getDocClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log('Processing event: ', event)
  const authorization: string = event.headers.Authorization;
  const userId: string = getUser(authorization);


1
  const result = await docClient.query({
    TableName: todosTable,
    IndexName : "userId-timestamp-index",
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames:{
      "#userId": "userId"
    },
    ExpressionAttributeValues: {
      ":userId": userId
    },
    ScanIndexForward : false
  }).promise()

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
