import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './parser';
import { TranslationMetaFormat } from '../app';

/**
 * A file parser that gets translations from JSON translation files and puts
 * them into a meta format.
 */
export class JsonParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[] {
    const jsonFileList: string[] = [];

    if (fs.existsSync(absolutePath)) {
      fs.readdirSync(absolutePath).forEach((fileName: string) => {
        if (fileName.substr(-5) === '.json') {
          jsonFileList.push(path.join(absolutePath, fileName));
        }
      });
    } else {
      console.error('Upload directory does not exist:', absolutePath);
    }

    if (jsonFileList.length === 0) {
      console.warn('No JSON translation files could be found.');
      return [];
    } else {
      console.log(`Found ${jsonFileList.length} JSON files.`);
      return this.parseFiles(jsonFileList);
    }
  }

  public parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[] {
    const existingJsonFiles: any = {};
    const allAvailableKeys: string[] = [];

    absoluteFilePaths.forEach((filePath: string) => {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath).replace('.json', '');

        // parse file content as JSON
        existingJsonFiles[fileName] = JSON.parse(fs.readFileSync(filePath, {
          encoding: 'utf8'
        }));

        // collect all available keys from JSON content
        Object.keys(existingJsonFiles[fileName]).forEach((key: string) => {
          if (allAvailableKeys.indexOf(key) === -1) {
            allAvailableKeys.push(key);
          }
        });
      } else {
        console.error('Could not find file for path:', absoluteFilePaths);
      }
    });

    allAvailableKeys.sort();

    return allAvailableKeys.map((key: string) => {
      const translationObject: any = { key };

      Object.keys(existingJsonFiles).forEach((languageKey: string) => {
        translationObject[languageKey] = existingJsonFiles[languageKey][key] || '';
      });

      return translationObject;
    });
  }
}
