import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:Request, res:Response ) => {
    res.send("try GET /filteredimage?image_url={{}}").status(200);
  } );
  
  /**
   * The filteredimage endpoint receives a image_url to downloaded it and process it locally, 
   * return it and then delete it.
   */
  app.get( "/filteredimage", async ( req:Request, res:Response ) => {
    
    //We validate that the request has query params and also that the image_url is set.
    if(!req.query||!req.query.image_url)
    {
      res.send("Please include image_url as a query param").status(400);
    }
    
    //We create the constant and then we get the resulting url for the local picture.
    const image_url:string = req.query.image_url;
    const filteredImage:string = await filterImageFromURL(image_url);

    //After finishing sending the file, we delete it.
    res.sendFile(filteredImage, () => {
      deleteLocalFiles([filteredImage])
    });
    
  } );
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();