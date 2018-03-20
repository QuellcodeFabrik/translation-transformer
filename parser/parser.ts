import { TranslationMetaFormat } from '../contracts/app.contract';

export interface Parser {
  /**
   * Parses all files that are located at the given absolute location.
   *
   * @param {string} absolutePath
   * @returns {TranslationMetaFormat[]}
   */
  parseFilesFromDirectory(absolutePath: string): TranslationMetaFormat[];

  /**
   * Parses all files by their absolute file paths given in the
   * absoluteFilePaths array.
   *
   * @param {Array<string>} absoluteFilePaths
   * @returns {TranslationMetaFormat}
   */
  parseFiles(absoluteFilePaths: string[]): TranslationMetaFormat[];
}
