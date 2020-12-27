// import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { getDocClient } from '../utils/dynamodb';


// const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { getTodoImageUrl } from '../utils/s3'


export class TodoDataLayer {
  private readonly docClient: DocumentClient;
  private readonly todosTable: string;
  private readonly userId: string;


  constructor(
    userId:string = null
  ) {
    this.docClient = getDocClient();
    this.todosTable = process.env.TODOS_TABLE;
    this.userId = userId;
  }

  async getAllTodos(): Promise<TodoItem[]> {
    console.log('Getting all groups')

    const result = await this.docClient.scan({
      TableName: this.todosTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async addAttachmentUrl(todoId:string) : Promise<any> {
    const attachmentUrl = getTodoImageUrl(todoId);
    const params = {
      TableName:this.todosTable,
      Key:{
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues:{
        ":attachmentUrl": attachmentUrl,
        ":userId" : this.userId
      },
      ReturnValues:"ALL_NEW"
    };

    console.log("Attempting a conditional update...");

    return new Promise((resolve,reject)=>{
      this.docClient.update(params, function(err, data) {
        if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
          resolve(data);
        }
      });
    })

  }
}
