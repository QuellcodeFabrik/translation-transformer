import * as path from 'path';
import * as ExcelWorker from 'xlsx';
import { Composer } from './composer';
import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file composer that gets translations in a meta format and writes those
 * translations into an Excel file.
 */
export class ExcelComposer implements Composer {
  private translationsWorkSheetName = 'DCP Translations';
  private fileMappingWorkSheetName = 'Do not modify';

  public initialize(configuration: any): boolean {
    console.log('Initialize ExcelComposer');

    if (configuration.hasOwnProperty('translationsWorkSheetName')) {
      this.translationsWorkSheetName = configuration.translationsWorkSheetName;
    }

    if (configuration.hasOwnProperty('fileMappingWorkSheetName')) {
      this.fileMappingWorkSheetName = configuration.fileMappingWorkSheetName;
    }

    return true;
  }

  public createTranslationFiles(
    targetDirectory: string,
    translationObjects: TranslationMetaFormat[],
    baseLanguage: string,
    fileMappings?: FileMapping[]): number {

    const sheetNamesArray = [this.translationsWorkSheetName];
    const sheetsObject: { [index: string]: ExcelWorker.Sheet } = {
      [this.translationsWorkSheetName]: ExcelComposer.createTranslationSheet(translationObjects, baseLanguage)
    };

    if (fileMappings) {
      sheetNamesArray.push(this.fileMappingWorkSheetName);
      sheetsObject[this.fileMappingWorkSheetName] = ExcelComposer.createFileMappingSheet(fileMappings);
    }

    const wb = { SheetNames: sheetNamesArray, Sheets: sheetsObject};
    ExcelWorker.writeFile(wb, path.join(targetDirectory, 'translations.xlsx'));

    return 1;
  }

  private static createFileMappingSheet(fileMappings: FileMapping[]): ExcelWorker.Sheet {
    const excelHeader = ['languageKey', 'fileName'];

    return ExcelWorker.utils.json_to_sheet(fileMappings, {
      header: excelHeader
    });
  }

  private static createTranslationSheet(
    translationObjects: TranslationMetaFormat[],
    baseLanguage: string): ExcelWorker.Sheet {

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

    return ExcelWorker.utils.json_to_sheet(translationObjects, {
      header: excelHeader
    });
  }
}
