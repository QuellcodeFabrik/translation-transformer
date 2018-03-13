import * as ExcelWriter from 'xlsx';
import * as englishTranslations from './translations/en.json';
import * as italianTranslations from './translations/it.json';

export interface TranslationMetaFormat {
  // the actual translation key
  key: string;

  // any number of language keys with their corresponding translations
  [languageKey: string]: string;
}

const allAvailableKeys: string[] = [];

Object.keys(englishTranslations).concat(Object.keys(italianTranslations)).forEach((key: string) => {
  if (allAvailableKeys.indexOf(key) === -1) {
    allAvailableKeys.push(key);
  }
});

allAvailableKeys.sort();

const translationObjects: TranslationMetaFormat[] = allAvailableKeys.map((key: string) => {
  return {
    key,
    en: (englishTranslations as any)[key] ? (englishTranslations as any)[key] : '',
    it: (italianTranslations as any)[key] ? (italianTranslations as any)[key] : ''
  };
});

const ws = ExcelWriter.utils.json_to_sheet(translationObjects, { header: ['key', 'en', 'it'] });

const wb = { SheetNames: ['DCP_Translations'], Sheets: {
  DCP_Translations: ws
}};

ExcelWriter.writeFile(wb, 'out.xlsx');
