/// <reference path="definitions.d.ts"/>

import * as XLSX from 'xlsx';
import * as englishTranslations from './translations/en.json';
import * as italianTranslations from './translations/it.json';

let allAvailableKeys: any[] = [];

Object.keys(englishTranslations).concat(Object.keys(italianTranslations)).forEach(key => {
  if (allAvailableKeys.indexOf(key) === -1) {
    allAvailableKeys.push(key);
  }
});

allAvailableKeys.sort();

let translationObjects = allAvailableKeys.map(key => {
  return {
    key: key,
    en: englishTranslations.hasOwnProperty(key) ? (<any>englishTranslations)[key] : '',
    it: italianTranslations.hasOwnProperty(key) ? (<any>italianTranslations)[key] : ''
  };
});

let ws = XLSX.utils.json_to_sheet(translationObjects, {header:['key', 'en', 'it']});

const wb = { SheetNames: ["DCP_Translations"], Sheets: {
  'DCP_Translations': ws
}};

XLSX.writeFile(wb, 'out.xlsx');
