import { Composer } from './composer';
import { TranslationMetaFormat } from '../app';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into JSON translation files.
 */
export class JsonComposer implements Composer {
  public initialize(configuration: any): boolean {
    console.log('Initialize JsonComposer');
    return true;
  }

  public createTranslationFiles(translationObjects: TranslationMetaFormat[], targetDirectory: string): number {
    const availableLanguageKeys: string[] = Object.keys(translationObjects[0]).slice(1);
    console.log('Available languages:', availableLanguageKeys);

    availableLanguageKeys.forEach((languageKey: string) => {
      const result: any = {};

      translationObjects.forEach((translationObject: TranslationMetaFormat) => {
        result[translationObject.key] = translationObject[languageKey] || '';
      });

      fs.writeFileSync(path.join(targetDirectory, languageKey + '.json'),
        JSON.stringify(result, null, 2));
    });

    return availableLanguageKeys.length;
  }
}
