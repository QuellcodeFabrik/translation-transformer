import { TranslationMetaFormat } from '../contracts/app.contract';

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
   * @param {TranslationMetaFormat[]} input
   * @param {string} absoluteTargetLocation
   * @param {string} baseLanguage
   * @returns {number} number of created files
   */
  createTranslationFiles(
    input: TranslationMetaFormat[], absoluteTargetLocation: string, baseLanguage?: string): number;
}
