import { Parser } from './parser';
import { TranslationMetaFormat } from '../app';
import * as path from 'path';
import * as fs from 'fs';

interface FormElement {
  key: string;
  type: string;
  title?: string;
  titleMap?: TitleMap[];
  validationMessage?: { [index: string]: string };
}

interface TitleMap {
  name: string;
  value: any;
}

/**
 * A file parser that gets translations from form configuration files and puts
 * them into a meta format.
 */
export class FormConfigurationParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[] {
    const formConfigurationsFileList: string[] = [];

    if (fs.existsSync(absolutePath)) {
      fs.readdirSync(absolutePath).forEach((fileName: string) => {
        if (fileName.substr(-5) === '.json') {
          formConfigurationsFileList.push(path.join(absolutePath, fileName));
        }
      });
    } else {
      console.error('Upload directory does not exist:', absolutePath);
    }

    if (formConfigurationsFileList.length === 0) {
      console.warn('No form configuration files could be found.');
      return [];
    } else {
      console.log(`Found ${formConfigurationsFileList.length} form configuration files.`);
      return this.parseFiles(formConfigurationsFileList);
    }
  }

  public parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[] {

    // Fields to parse from form configuration
    //
    // formElementConfigurations -> {} :: titleMap -> {} :: name
    // formElementConfigurations -> {} :: validationMessage :: 'every index value'
    // formElementConfigurations -> {} :: title
    //
    // The translation key will be composed as follows:
    // form.{formId}.{elementKey}.title
    // form.{formId}.{elementKey}.validationMessage.{indexValue}
    // form.{formId}.{elementKey}.titleMap.{value}

    const existingFormConfigurations: any = {};
    const existingTranslationKeys: any = {};

    absoluteFilePaths.forEach((filePath: string) => {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath).replace('.json', '');

        // parse file content as JSON
        existingFormConfigurations[fileName] = JSON.parse(fs.readFileSync(filePath, {
          encoding: 'utf8'
        }));

        if (
          !existingFormConfigurations[fileName].hasOwnProperty('id') ||
          !existingFormConfigurations[fileName].hasOwnProperty('formElementConfigurations') ||
          !existingFormConfigurations[fileName].hasOwnProperty('schema')
        ) {
          console.warn(`Schema form configuration for ${fileName + '.json'} is not valid. Skipping file.`);
          delete existingFormConfigurations[fileName];
          return;
        }

        // collect all available keys from JSON content
        existingFormConfigurations[fileName].formElementConfigurations.forEach((element: FormElement) => {
          const baseTranslationKey = 'form.' +
            FormConfigurationParser.normalizeFormId(existingFormConfigurations[fileName].id) + '.' +
            element.key;

          let translationKey: string;

          if (element.title) {
            translationKey = baseTranslationKey + '.title';

            FormConfigurationParser.addTranslationKey(
              existingTranslationKeys, translationKey, fileName, element.title);
          }

          if (element.titleMap) {
            element.titleMap.forEach((titleMap: TitleMap) => {
              translationKey = baseTranslationKey + '.titleMap.' + titleMap.value;

              FormConfigurationParser.addTranslationKey(
                existingTranslationKeys, translationKey, fileName, titleMap.name);
            });
          }

          if (element.validationMessage) {
            Object.keys(element.validationMessage).forEach((messageId: string) => {
              translationKey = baseTranslationKey + '.validationMessage.' + messageId;

              FormConfigurationParser.addTranslationKey(
                existingTranslationKeys, translationKey, fileName, element.validationMessage![messageId]);
            });
          }
        });
      } else {
        console.error('Could not find file for path:', absoluteFilePaths);
      }
    });

    if (Object.keys(existingFormConfigurations).length === 0 && absoluteFilePaths.length > 0) {
      throw Error('Given form configuration files are not valid.');
    }

    return Object.keys(existingTranslationKeys).map((key: string) => {
      return Object.assign({key}, existingTranslationKeys[key]);
    });
  }

  /**
   * Convenience method to add translation keys to the existingKeys object.
   *
   * @param existingKeys
   * @param {string} key
   * @param {string} language
   * @param {string} value
   */
  private static addTranslationKey(existingKeys: any, key: string, language: string, value: string): void {
    if (!existingKeys.hasOwnProperty(key)) {
      existingKeys[key] = {};
    }

    existingKeys[key][language] = value;
  }

  /**
   * Remove all dots from the form id to not confuse it with the dots used in
   * the translation keys.
   *
   * @param {string} id
   * @returns {string}
   */
  private static normalizeFormId(id: string): string {
    return id.replace(/\./gi, '_');
  }
}
