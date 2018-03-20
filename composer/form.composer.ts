import { Composer } from './composer';
import { TranslationMetaFormat } from '../app';
import { FormConfiguration, FormElement, TitleMap } from '../contracts/form-configuration.contract';
import * as helper from '../helper/helper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into form configuration files.
 */
export class FormConfigurationComposer implements Composer {
  public initialize(configuration: any): boolean {
    console.log('Initialize FormConfigurationComposer');
    return true;
  }

  /**
   * Creates the form configuration files from the given translationObjects.
   * Additionally it uses the uploaded form configuration file(s). There are
   * two scenarios:
   *
   * 1. Only one form configuration file was uploaded:
   *    This form configuration file shall be used as blueprint to create form
   *    configuration files for all languages that are present in the Excel file.
   *
   * 2. Multiple form configurations have been uploaded:
   *    Those uploaded form configurations shall be updated based on the
   *    translations given in the Excel file.
   *
   * @param {TranslationMetaFormat[]} translationObjects
   * @param {string} targetDirectory
   * @returns {number}
   */
  public createTranslationFiles(translationObjects: TranslationMetaFormat[], targetDirectory: string): number {
    const formConfigurationFiles: { [index: string]: FormConfiguration } = {};

    const availableLanguageKeys: string[] = Object.keys(translationObjects[0]).slice(1);
    console.log('Available languages:', availableLanguageKeys);

    fs.readdirSync(targetDirectory).forEach((fileName: string) => {
      if (fileName.substr(-5) === '.json') {
        const filePath = path.join(targetDirectory, fileName);
        const languageKey = fileName.replace('.json', '');

        // parse file content as JSON
        formConfigurationFiles[languageKey] = JSON.parse(fs.readFileSync(filePath, {
          encoding: 'utf8'
        }));
      }
    });

    const numberOfFormConfigurations = Object.keys(formConfigurationFiles).length;
    let numberOfCreatedFormConfigurations = 0;

    if (numberOfFormConfigurations === 1) {
      console.log('Using provided form configuration file as blueprint.');
    } else if (numberOfFormConfigurations > 1) {
      console.log('Modifying provided from configuration files.');
    } else {
      throw Error('No form configuration file provided.');
    }

    availableLanguageKeys.forEach((languageKey: string) => {
      let result: FormConfiguration | undefined;

      if (numberOfFormConfigurations > 1) {
        if (formConfigurationFiles.hasOwnProperty(languageKey)) {
          result = formConfigurationFiles[languageKey];
        } else {
          console.warn(`No form configuration file for '${languageKey}' provided.`);
        }
      } else {
        result = formConfigurationFiles[Object.keys(formConfigurationFiles)[0]];
      }

      if (result !== undefined) {
        translationObjects.forEach((translationObject: TranslationMetaFormat) => {
          result = FormConfigurationComposer.applyTranslationToFormConfiguration(
            result as FormConfiguration, translationObject.key, translationObject[languageKey]
          );
        });

        fs.writeFileSync(path.join(targetDirectory, languageKey + '.json'),
          JSON.stringify(result, null, 2));

        numberOfCreatedFormConfigurations++;
      } else {
        console.warn(`Could not create form configuration for '${languageKey}'.`);
      }
    });

    return numberOfCreatedFormConfigurations;
  }

  /**
   * Apply the translation value for the given key to the form configuration
   * object. The key is composed as follows:
   *
   * form.{formId}.{elementKey}.title
   * form.{formId}.{elementKey}.validationMessage.{indexValue}
   * form.{formId}.{elementKey}.titleMap.{value}
   *
   * @param {FormConfiguration} formConfiguration
   * @param {string} key
   * @param {string} value
   * @returns {FormConfiguration}
   */
  private static applyTranslationToFormConfiguration(
    formConfiguration: FormConfiguration, key: string, value: string): FormConfiguration {

    const keySegments = key.split('.');
    const formId: string = keySegments[1];
    const elementKey: string = keySegments[2];
    const elementSection: string = keySegments[3];
    const valueSpecifier: string = keySegments[4];

    if (helper.normalizeFormId(formConfiguration.id) !== formId) {
      console.warn('Form configuration ID is not matching with translation reference.');
      return formConfiguration;
    }

    const elementToTranslate =
      formConfiguration.formElementConfigurations.find((element: FormElement) => {
        return element.key === elementKey;
      });

    if (!elementToTranslate) {
      return formConfiguration;
    }

    switch (elementSection) {
      case 'title':
        elementToTranslate.title = value;
        break;
      case 'validationMessage':
        if (elementToTranslate.validationMessage) {
          elementToTranslate.validationMessage[valueSpecifier] = value;
        }
        break;
      case 'titleMap':
        if (elementToTranslate.titleMap) {
          elementToTranslate.titleMap.forEach((titleMap: TitleMap) => {
            if (titleMap.value === valueSpecifier) {
              titleMap.name = value;
            }
          });
        }
        break;
      default:
        console.warn('Element section unknown.');
    }

    return formConfiguration;
  }
}
