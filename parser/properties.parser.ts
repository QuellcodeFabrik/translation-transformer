import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './parser';
import { TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file parser that gets translations from Java properties files and puts them
 * into a meta format.
 */
export class JavaPropertiesParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[] {
    const propertyFileList: string[] = [];

    if (fs.existsSync(absolutePath)) {
      fs.readdirSync(absolutePath).forEach((fileName: string) => {
        if (fileName.substr(-11) === '.properties') {
          propertyFileList.push(path.join(absolutePath, fileName));
        }
      });
    } else {
      console.error('Upload directory does not exist:', absolutePath);
    }

    if (propertyFileList.length === 0) {
      console.warn('No Java property files could be found.');
      return [];
    } else {
      console.log(`Found ${propertyFileList.length} Java property files.`);
      return this.parseFiles(propertyFileList);
    }
    }

  public parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[] {
    const existingPropertiesFiles: any = {};
    const allAvailableKeys: string[] = [];

    absoluteFilePaths.forEach((filePath: string) => {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath);

        const keyValuePairs: {key: string, value: string}[] = fs.readFileSync(filePath, 'utf-8')
          .split('\n')
          .filter(Boolean)
          .map((line: string) => {
            return {
              key: line.split('=')[0],
              value: line.split('=')[1]
            };
          });

        // parse file content as string array
        existingPropertiesFiles[fileName] = keyValuePairs;

        keyValuePairs.forEach((keyValuePair: {key: string, value: string}) => {
            if (allAvailableKeys.indexOf(keyValuePair.key) === -1) {
              allAvailableKeys.push(keyValuePair.key);
            }
        });
      } else {
        console.error('Could not find file for path:', absoluteFilePaths);
      }
    });

    if (Object.keys(existingPropertiesFiles).length === 0 && absoluteFilePaths.length > 0) {
      throw Error('Given Java property files are not valid.');
    }

    allAvailableKeys.sort();

    return allAvailableKeys.map((key: string) => {
      const translationObject: TranslationMetaFormat = { key };

      Object.keys(existingPropertiesFiles).forEach((fileName: string) => {
        translationObject[fileName] = existingPropertiesFiles[fileName][key] || '';
      });

      return translationObject;
    });
  }
}
