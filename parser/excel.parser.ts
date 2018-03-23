import * as fs from 'fs';
import * as ExcelWorker from 'xlsx';
import { Parser } from './parser';
import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

/**
 * A file parser that gets translations from an Excel file and puts them into
 * a meta format.
 */
export class ExcelParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[] {
    throw Error('Function not available for ExcelParser.');
  }

  public parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[] {
    if (absoluteFilePaths.length > 1) {
      console.warn('More than one file path given. Only considering first given path.');
    }

    const excelFilePath = absoluteFilePaths[0];

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
      return [];
    }

    return translationObjects;
  }

  /**
   * Extracts the file mappings from the seconds Excel worksheet if it is
   * available. Else it returns an empty array.
   *
   * @param {string} absolutePath
   * @returns {FileMapping[]}
   */
  public static extractFileMappingFromExcel(absolutePath: string): FileMapping[] {
    if (!fs.existsSync(absolutePath)) {
      console.warn('Excel file does not exist.');
      return [];
    }

    const wb = ExcelWorker.readFile(absolutePath);
    const ws = wb.Sheets[wb.SheetNames[1]];

    if (!ws || !ws.A1 || ws.A1.v !== 'languageKey' || ws.B1.v !== 'fileName') {
      console.warn('Worksheet format for file mapping is not correct.');
      return [];
    }

    const fileMappings: FileMapping[] = ExcelWorker.utils.sheet_to_json(ws, {});

    if (!fileMappings || fileMappings.length === 0) {
      console.warn('No file mappings found in Excel sheet.');
      return [];
    }

    return fileMappings;
  }
}

