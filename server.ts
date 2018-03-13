import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';

const server = express();

// enable Express' case-sensitive and strict options
server.enable('case sensitive routing');
server.enable('strict routing');

// enable CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// add a custom error handler
server.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.xhr) {
    res.status(err.status).json(err.message);
  } else {
    next(err);
  }
});

// serve static files from static folder
server.use(express.static('static'));

// REST API routes
server.get('/api/test', (req: Request, res: Response) => {
  res.status(200).send('Alright!');
});

// start listening on port 8000
console.log('Translation Service listening on port 8000.');
server.listen(8000);
