import { TranslationMetaFormat } from '../app';

export interface Composer {
  /**
   * Initializes the composer object and returns true if initialization was
   * successful.
   *
   * @param configuration
   * @returns {boolean}
   */
  initialize(configuration: any): boolean;

  /**
   * Transforms the given input data into the output files as defined for the
   * specific composer implementation. Returns the number of files created.
   *
   * @param {TranslationMetaFormat} input
   * @param {string} absoluteTargetLocation
   * @returns {number}
   */
  createTranslationFiles(
    input: TranslationMetaFormat, absoluteTargetLocation: string): number;
}
