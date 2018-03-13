import { Parser } from './parser';
import { TranslationMetaFormat } from '../app';

class ExcelParser implements Parser {
  public parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[] {
    return [];
  }

  public parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[] {
    return [];
  }
}
