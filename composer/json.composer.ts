import * as fs from 'fs';
import * as path from 'path';
import { Composer } from './composer';
import { TranslationMetaFormat } from '../contracts/app.contract';

const emptyTranslationPlaceholder = '<hide>';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into JSON translation files.
 */
export class JsonComposer implements Composer {
  public initialize(configuration: any): boolean {
    console.log('Initialize JsonComposer');
    return true;
  }

  public createTranslationFiles(targetDirectory: string, translationObjects: TranslationMetaFormat[]): number {
    const availableLanguageKeys: string[] = Object.keys(translationObjects[0]).slice(1);
    console.log('Available languages:', availableLanguageKeys);

    availableLanguageKeys.forEach((languageKey: string) => {
      const result: any = {};

      translationObjects.forEach((translationObject: TranslationMetaFormat) => {
        // replace translation placeholder with empty string
        const translation = translationObject[languageKey] === emptyTranslationPlaceholder ?
          '' : translationObject[languageKey];

        result[translationObject.key] = translation || '';
      });

      fs.writeFileSync(path.join(targetDirectory, languageKey + '.json'),
        JSON.stringify(result, null, 2));
    });

    return availableLanguageKeys.length;
  }
}
