import * as express from 'express';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as shortid from 'shortid';
import * as app from './app';
import { Request, Response, NextFunction } from 'express-serve-static-core';

if (!fs.existsSync('uploads')) {
  console.log('Creating uploads directory.');
  fs.mkdirSync('uploads');
}

if (!fs.existsSync('output')) {
  console.log('Creating output directory.');
  fs.mkdirSync('output');
}

const storage = multer.diskStorage({
  destination: (req: any, file, callback) => {
    let destinationPath = './uploads';
    if (req.userToken) {
      destinationPath += '/' + req.userToken;
    }

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }

    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + path.extname(file.originalname));
  }
});

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

server.post('/api/transform-excel', (req: Request & any, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    fileFilter: (request, file, callback: any) => {
      if (path.extname(file.originalname) !== '.xlsx') {
        return callback('Only .xlsx files are allowed.', null);
      }
      callback(null, true);
    }}).single('translations');

  const uniqueId = shortid.generate();
  req.userToken = uniqueId;

  upload(req, res, (err: Error) => {
    if (err) {
      console.error('Something went wrong with Excel file upload:', err);
      return res.end(err);
    }

    // req.body['test-value'] is now available

    // start transformation process
    app.createJsonTranslationFilesFromExcel(path.join(__dirname, 'uploads', uniqueId, 'translations.xlsx'));

    // delete uniqueId folder
    fs.unlinkSync(path.join(__dirname, 'uploads', uniqueId, 'translations.xlsx'));
    fs.rmdirSync(path.join(__dirname, 'uploads', uniqueId));

    res.end('File has been transformed.');
  });
});

server.post('/api/transform-json-translations', (req: Request, res: Response, next: NextFunction) => {
    // req.files is array of `translations` files
    // req.body will contain the text fields, if there were any
});

// start listening on port 8000
console.log('Translation Service listening on port 8000.');
server.listen(8000);
