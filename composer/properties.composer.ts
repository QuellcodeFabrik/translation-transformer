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
    baseLanguage: string,
    fileMappings: FileMapping[]): number {

    const availableLanguageKeys: string[] = Object.keys(translationObjects[0]).slice(1);
    console.log('Available languages:', availableLanguageKeys);
    console.log('File mappings:', fileMappings);

    // availableLanguageKeys.forEach((languageKey: string) => {
    //   const result: any = {};
    //
    //   translationObjects.forEach((translationObject: TranslationMetaFormat) => {
    //     result[translationObject.key] = translationObject[languageKey] || '';
    //   });
    //
    //   fs.writeFileSync(path.join(targetDirectory, languageKey + '.json'),
    //     JSON.stringify(result, null, 2));
    // });

    return availableLanguageKeys.length;
  }
}
