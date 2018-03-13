import * as ExcelWorker from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { JsonParser } from './parser/json.parser';

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
 */
export function createExcelFromJsonTranslationFiles(targetDirectory: string) {
    const jsonParser = new JsonParser();

    const translationObjects: TranslationMetaFormat[] =
        jsonParser.parseFilesFromDirectory(targetDirectory);

    const ws = ExcelWorker.utils.json_to_sheet(translationObjects, {
        header: ['key', 'en', 'it']
    });

    const wb = { SheetNames: ['DCP_Translations'], Sheets: {
            DCP_Translations: ws
        }};

    ExcelWorker.writeFile(wb, path.join(targetDirectory, 'translations.xlsx'));
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
    return;
  }

  const wb = ExcelWorker.readFile(excelFilePath);
  const ws = wb.Sheets[wb.SheetNames[0]];

  // TODO validate worksheet format

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
