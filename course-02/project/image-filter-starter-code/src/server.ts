import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteTmpFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // endpoint steps:
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get( "/filteredimage/", ( req, res ) => {

    // Only allow authorized requests
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
      return res.status(401).send({ message: 'Authorization header is required.' });
    }

    let { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send('image_url is required.');
    }

    let _ = filterImageFromURL(image_url).then(
      result => {
        res.status(200).sendFile(result);
        return result;
      })
    .catch(
      // Surface the error from the util function
      error => {
        res.status(422).send(error);
        return '';
    })
    .then(
      () => {
        deleteTmpFiles();
    });
    
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
