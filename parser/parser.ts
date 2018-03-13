import { TranslationMetaFormat } from '../app';

export interface Parser {
  /**
   * Parses all files that are located at the given absolute location. Will
   * also check for files in sub folders if the recursive parameter is set to
   * true.
   *
   * @param {string} absolutePath
   * @param {boolean} recursive
   * @returns {Promise<TranslationMetaFormat>}
   */
  parseFilesFromDirectory(
    absolutePath: string, recursive: boolean): Promise<TranslationMetaFormat>;

  /**
   * Parses all files by their absolute file paths given in the
   * absoluteFilePaths array.
   *
   * @param {Array<string>} absoluteFilePaths
   * @returns {Promise<TranslationMetaFormat>}
   */
  parseFiles(absoluteFilePaths: string[]): Promise<TranslationMetaFormat>;
}
