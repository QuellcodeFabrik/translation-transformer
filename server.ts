import * as express from 'express';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as shortid from 'shortid';
import * as app from './app';
import { Request, Response, NextFunction } from 'express-serve-static-core';

if (!fs.existsSync('temp')) {
  console.log('Creating temp directory.');
  fs.mkdirSync('temp');
}

const storage = multer.diskStorage({
  destination: (req: any, file, callback) => {
    let destinationPath = './temp';
    if (req.userToken) {
      destinationPath += '/' + req.userToken;
    }

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }

    callback(null, destinationPath);
  },
  filename: (req: any, file, callback) => {
    if (req.useOriginalFileName) {
      callback(null, file.originalname);
    } else {
      callback(null, file.fieldname + path.extname(file.originalname));
    }
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

// REST test endpoint to check if API is set into place.
server.get('/api/test', (req: Request, res: Response) => {
  res.status(200).send('Alright!');
});

// REST endpoint to transform an Excel file to different JSON files each of
// them containing translations for one language key.
server.post('/api/transform-excel', (req: Request & any, res: Response) => {
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
    // req.body['test-value'] is now available

    if (err) {
      console.error('Something went wrong with Excel file upload:', err);
      return res.end(err);
    }

    const targetDirectory = path.join(__dirname, 'temp', uniqueId);

    // start transformation process
    app.createJsonTranslationFilesFromExcel(targetDirectory, 'translations.xlsx');

    // The zip library needs to be instantiated:
    const zipFileLibrary = require('node-zip');
    const zip = new zipFileLibrary();

    // You can add multiple files by performing subsequent calls to zip.file();
    // the first argument is how you want the file to be named inside your zip,
    // the second is the actual data:
    fs.readdirSync(targetDirectory).forEach((fileName: string) => {
      if (fileName.substr(-5) === '.json') {
        zip.file(fileName, fs.readFileSync(path.join(targetDirectory, fileName)));
      }
    });

    const data = zip.generate({ base64: false, compression: 'DEFLATE' });

    // it's important to use *binary* encode
    fs.writeFileSync(path.join(targetDirectory, 'translations.zip'), data, 'binary');

    res.download(path.join(targetDirectory, 'translations.zip'), 'translations.zip', (downloadError: Error) => {
      if (downloadError) {
        console.error('Could not send translations.zip to client:', downloadError);
      }

      // delete uniqueId folder and all content
      fs.readdirSync(targetDirectory).forEach((fileName: string) => {
        fs.unlinkSync(path.join(targetDirectory, fileName));
      });

      fs.rmdirSync(targetDirectory);
    });
  });
});

// REST endpoint to transform multiple JSON files into one Excel file
// containing all keys and available translations
server.post('/api/transform-json-files', (req: Request & any, res: Response) => {
  const upload = multer({
    storage,
    fileFilter: (request, file, callback: any) => {
      if (path.extname(file.originalname) !== '.json') {
        return callback('Only .json files are allowed.', null);
      }
      callback(null, true);
    }}).array('translations', 20);

  const uniqueId = shortid.generate();
  req.userToken = uniqueId;
  req.useOriginalFileName = true;

  upload(req, res, (err: Error) => {
    const baseLanguage = req.body['base-language'];
    console.log('Base language:', baseLanguage);

    if (err) {
      console.error('Something went wrong with JSON files upload:', err);
      return res.end(err);
    }

    const targetDirectory = path.join(__dirname, 'temp', uniqueId);

    // start transformation process
    app.createExcelFromJsonTranslationFiles(targetDirectory, baseLanguage);

    res.download(path.join(targetDirectory, 'translations.xlsx'), 'translations.xlsx', (downloadError: Error) => {
      if (downloadError) {
        console.error('Could not send translations.xlsx to client:', downloadError);
      }

      // delete uniqueId folder and all content
      fs.readdirSync(targetDirectory).forEach((fileName: string) => {
        fs.unlinkSync(path.join(targetDirectory, fileName));
      });

      fs.rmdirSync(targetDirectory);
    });
  });
});

// start listening on port 8000
console.log('Translation Service listening on port 8000.');
server.listen(8000);
