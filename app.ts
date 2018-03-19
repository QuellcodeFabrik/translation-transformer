import * as ExcelWorker from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { JsonParser } from './parser/json.parser';
import { FormConfigurationParser } from './parser/form.parser';

export interface TranslationMetaFormat {
  // the actual translation key
  key: string;

  // any number of language keys with their corresponding translations
  [languageKey: string]: string;
}

/**
 * Parses the JSON translation files in the given directory and creates an
 * Excel workbook out of it.
 *
 * @param {string} targetDirectory
 * @param {string} baseLanguage
 */
export function createExcelFromFormConfigurationFiles(targetDirectory: string, baseLanguage: string) {
  const formConfigurationParser = new FormConfigurationParser();

  const translationObjects: TranslationMetaFormat[] =
    formConfigurationParser.parseFilesFromDirectory(targetDirectory);

  if (!translationObjects || translationObjects.length === 0) {
    throw Error('No form configuration files have been selected.');
  }

  createExcelFile(targetDirectory, translationObjects, baseLanguage);
}

/**
 * Parses the JSON translation files in the given directory and creates an
 * Excel workbook out of it.
 *
 * @param {string} targetDirectory
 * @param {string} baseLanguage
 */
export function createExcelFromJsonTranslationFiles(targetDirectory: string, baseLanguage: string) {
  const jsonParser = new JsonParser();

  const translationObjects: TranslationMetaFormat[] =
      jsonParser.parseFilesFromDirectory(targetDirectory);

  if (!translationObjects || translationObjects.length === 0) {
    throw Error('No JSON translation files have been selected.');
  }

  createExcelFile(targetDirectory, translationObjects, baseLanguage);
}

/**
 * Creates the JSON translation files from the given Excel file.
 *
 * @param {string} targetDirectory absolute path to the output directory
 * @param {string} excelFileName
 */
export function createJsonTranslationFilesFromExcel(targetDirectory: string, excelFileName: string) {
  const excelFilePath = path.join(targetDirectory, excelFileName);

  if (!fs.existsSync(excelFilePath)) {
    console.warn('Excel file does not exist.');
    throw Error('No Excel file has been selected.');
  }

  const wb = ExcelWorker.readFile(excelFilePath);
  const ws = wb.Sheets[wb.SheetNames[0]];

  if (!ws.A1 || ws.A1.v !== 'key') {
    console.warn('Worksheet format is not correct.');
    throw Error('Worksheet format is not correct. Key column is missing.');
  }

  const translationObjects: TranslationMetaFormat[] =
      ExcelWorker.utils.sheet_to_json(ws, {});

  if (!translationObjects || translationObjects.length === 0) {
    console.warn('No translation data found in Excel sheet.');
    return;
  }

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
}

/**
 *
 *
 * @param {string} targetDirectory
 * @param {TranslationMetaFormat[]} translations
 * @param {string} baseLanguage
 */
function createExcelFile(targetDirectory: string, translations: TranslationMetaFormat[], baseLanguage?: string) {
  const excelHeader = ['key'];

  // always have the base language at the second position
  if (baseLanguage) {
    excelHeader.push(baseLanguage);
  }

  Object.keys(translations[0]).forEach((languageKey: string) => {
    if (excelHeader.indexOf(languageKey) === -1) {
      excelHeader.push(languageKey);
    }
  });

  const ws = ExcelWorker.utils.json_to_sheet(translations, {
    header: excelHeader
  });

  const wb = { SheetNames: ['DCP_Translations'], Sheets: {
      DCP_Translations: ws
    }};

  ExcelWorker.writeFile(wb, path.join(targetDirectory, 'translations.xlsx'));
}