import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

export interface Parser {
  /**
   * Parses all files that are located at the given absolute location.
   *
   * @param {string} absolutePath
   * @param {Array<FileMapping>} fileMapping
   * @returns {TranslationMetaFormat[]}
   */
  parseFilesFromDirectory(absolutePath: string, fileMapping?: FileMapping[]): TranslationMetaFormat[];

  /**
   * Parses all files by their absolute file paths given in the
   * absoluteFilePaths array.
   *
   * @param {Array<string>} absoluteFilePaths
   * @param {Array<FileMapping>} fileMapping
   * @returns {TranslationMetaFormat}
   */
  parseFiles(absoluteFilePaths: string[], fileMapping?: FileMapping[]): TranslationMetaFormat[];
}
