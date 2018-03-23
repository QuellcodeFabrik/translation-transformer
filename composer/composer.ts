import { FileMapping, TranslationMetaFormat } from '../contracts/app.contract';

export interface Composer {
  /**
   * Initializes the composer object and returns true if initialization was
   * successful.
   *
   * @param configuration
   * @returns {boolean} true if initialization was successful
   */
  initialize(configuration: any): boolean;

  /**
   * Transforms the given input data into the output files as defined for the
   * specific composer implementation. Returns the number of files created.
   *
   * @param {string} absoluteTargetLocation
   * @param {TranslationMetaFormat[]} input
   * @param {string} baseLanguage
   * @param {FileMapping[]} fileMappings
   * @returns {number} number of created files
   */
  createTranslationFiles(
    absoluteTargetLocation: string,
    input: TranslationMetaFormat[],
    baseLanguage?: string,
    fileMappings?: FileMapping[]): number;
}
