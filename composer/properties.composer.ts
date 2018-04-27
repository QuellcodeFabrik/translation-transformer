import * as fs from 'fs';
import * as path from 'path';
import { Composer } from './composer';
import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into Java properties files.
 */
export class JavaPropertiesComposer implements Composer {
  public initialize(configuration: any): boolean {
    console.log('Initialize JavaPropertyComposer');
    return true;
  }

  public createTranslationFiles(
    targetDirectory: string,
    translationObjects: TranslationMetaFormat[],
    baseLanguage?: string,
    fileMappings?: FileMapping[]): number {

    const availableLanguageKeys: string[] = Object.keys(translationObjects[0]).slice(1);
    console.log('Available languages:', availableLanguageKeys);

    availableLanguageKeys.forEach((languageKey: string) => {
      let result = '';

      translationObjects.forEach((translationObject: TranslationMetaFormat) => {
        result += translationObject.key.trim() + ' = ' + translationObject[languageKey].trim() + '\n';
      });

      const matchingFileMapping = fileMappings ? fileMappings.filter((fileMapping: FileMapping) => {
        return fileMapping.languageKey === languageKey;
      })[0] : undefined;

      const fileName = matchingFileMapping ? matchingFileMapping.fileName : languageKey + '.properties';

      fs.writeFileSync(path.join(targetDirectory, fileName), result);
    });

    return availableLanguageKeys.length;
  }
}
