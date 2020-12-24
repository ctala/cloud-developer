//Imports
import 'source-map-support/register'
import * as uuid from 'uuid'
import { getDocClient } from '../../utils/dynamodb'
import { getUser } from '../../utils/user'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

//Logger
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

//Variables
const docClient = getDocClient()
const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoId = uuid.v4()
  const authorization: string = event.headers.Authorization
  const userId: string = getUser(authorization)

  //Time Related Variables
  const createdAtTimestamp = Math.floor(Date.now() / 1000);
  const createdAt = new Date(createdAtTimestamp*1000).toISOString();
  const updatedAt = createdAt;

  //New Todo Item
  const newItem: any = {
    todoId: todoId,
    userId: userId,
    attachmentUrl: null,
    done: false,
    timestamp: createdAtTimestamp,
    createdAt,
    updatedAt,
    ...newTodo
  }

  logger.info('New Item 2 Add', { item: newItem, table: todosTable });

  // console.log(newItem)

  let statusCode = 200;
  let returnBody = {};

  try {
    await docClient.put({
      TableName: todosTable,
      Item: newItem
    }).promise()
    returnBody = { item: newItem };

  }catch (e) {
      statusCode = 500;
  }


  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(returnBody)
  }
}
