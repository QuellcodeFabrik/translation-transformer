import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './parser';
import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file parser that gets translations from Java properties files and puts them
 * into a meta format.
 */
export class JavaPropertiesParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string, fileMappings: FileMapping[]): TranslationMetaFormat[] {
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
      return this.parseFiles(propertyFileList, fileMappings);
    }
    }

  public parseFiles(absoluteFilePaths: string[], fileMappings: FileMapping[]): TranslationMetaFormat[] {
    const existingPropertiesFiles: any = {};
    const allAvailableKeys: string[] = [];

    const fileMapper: {[index: string]: any} = fileMappings.reduce((previousValue, currentValue) => {
      return Object.assign({}, previousValue, {
        [currentValue.fileName]: currentValue.languageKey
      });
    }, {});

    absoluteFilePaths.forEach((filePath: string) => {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath);

        const keyValuePairs: {[index: string]: string} = fs.readFileSync(filePath, 'utf-8')
          .split('\n')
          .filter((line: string) => line && line.length > 0)
          .map((line: string) => {
            line = line.replace('\r', '');
            return {
              key: line.split('=')[0],
              value: line.split('=')[1]
            };
          })
          .reduce((previousValue, currentValue) => {
            if (currentValue.key && currentValue.key.length > 0) {
              return Object.assign({}, previousValue, {
                [currentValue.key]: currentValue.value
              });
            } else {
              return previousValue;
            }
          }, {});

        // parse file content as string array
        existingPropertiesFiles[fileName] = keyValuePairs;

        Object.keys(keyValuePairs).forEach((key: string) => {
            if (allAvailableKeys.indexOf(key) === -1) {
              allAvailableKeys.push(key);
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
        const languageKey = fileMapper[fileName];
        translationObject[languageKey] = existingPropertiesFiles[fileName][key] || '';
      });

      return translationObject;
    });
  }
}
