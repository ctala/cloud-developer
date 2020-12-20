import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getDocClient } from '../../utils/dynamodb'
import { getUser } from '../../utils/user'

//Variables
const docClient = getDocClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  //Related to the user
  const authorization: string = event.headers.Authorization
  const userId: string = getUser(authorization)

  //Related to time
  const updatedAt: string = new Date(Date.now()).toISOString()


  //We update the item only if the logged user is the same as the creator
  const params: any = {
    TableName: todosTable,
    Key: {
      'todoId': todoId
    },
    UpdateExpression: 'set #name = :name, #dueDate=:dueDate, #done=:done, #updatedAt=:updatedAt',
    ConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#done': 'done',
      '#updatedAt': 'updatedAt',
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done,
      ':updatedAt': updatedAt,
      ':userId': userId
    },
    ReturnValues: 'ALL_NEW'
  }

  console.log('Updating the item...', params)
  let result = null
  let statusCode = 200
  let attributes = {}
  try {
    result = await docClient.update(params).promise()
    attributes = result.Attributes
    console.log(result)
  } catch (error) {
    statusCode = 500
    console.log(error)
  }


  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(attributes)
  }
}