import * as path from 'path';
import * as ExcelWorker from 'xlsx';
import { Composer } from './composer';
import { TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into an Excel file.
 */
export class ExcelComposer implements Composer {
  public initialize(configuration: any): boolean {
    console.log('Initialize ExcelComposer');
    return true;
  }

  public createTranslationFiles(
    translationObjects: TranslationMetaFormat[], targetDirectory: string, baseLanguage: string): number {

    const excelHeader = ['key'];

    // always have the base language at the second position
    if (baseLanguage) {
      excelHeader.push(baseLanguage);
    }

    Object.keys(translationObjects[0]).forEach((languageKey: string) => {
      if (excelHeader.indexOf(languageKey) === -1) {
        excelHeader.push(languageKey);
      }
    });

    const ws = ExcelWorker.utils.json_to_sheet(translationObjects, {
      header: excelHeader
    });

    const wb = { SheetNames: ['DCP_Translations'], Sheets: {
        DCP_Translations: ws
      }};

    ExcelWorker.writeFile(wb, path.join(targetDirectory, 'translations.xlsx'));

    return 1;
  }
}
