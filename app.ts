import * as ExcelWriter from 'xlsx';
import { JsonParser } from './parser/json.parser';
import * as path from 'path';

export interface TranslationMetaFormat {
  // the actual translation key
  key: string;

  // any number of language keys with their corresponding translations
  [languageKey: string]: string;
}

const jsonParser = new JsonParser();

const translationObjects: TranslationMetaFormat[] =
  jsonParser.parseFilesFromDirectory(path.join(__dirname, 'translations'));

const ws = ExcelWriter.utils.json_to_sheet(translationObjects, { header: ['key', 'en', 'it'] });

const wb = { SheetNames: ['DCP_Translations'], Sheets: {
  DCP_Translations: ws
}};

ExcelWriter.writeFile(wb, 'out.xlsx');
