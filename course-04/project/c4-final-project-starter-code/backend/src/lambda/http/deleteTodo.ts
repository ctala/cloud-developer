import 'source-map-support/register'
import { getDocClient } from '../../utils/dynamodb'
import { getUser } from '../../utils/user'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { int } from 'aws-sdk/clients/datapipeline'

//Variables
const docClient = getDocClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log(todoId)

  const authorization: string = event.headers.Authorization
  const userId: string = getUser(authorization)


  //Validamos que el usuario logueado sea el dueño del todo
  const params = {
    TableName: todosTable,
    Key: {
      'todoId': todoId
    },
    ConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }

  console.log('Attempting a conditional delete...', params)
  let statusCode: int = 200

  try {
    await docClient.delete(params).promise()
  } catch (e) {
    if (e.code = 'ConditionalCheckFailedException') {
      statusCode = 403
    } else {
      console.log(e)
      statusCode = 500
    }

  } finally {
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  }



}
