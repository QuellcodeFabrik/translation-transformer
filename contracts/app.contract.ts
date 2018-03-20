/**
 * The meta format that is used as intermediate format when transforming from
 * Excel files to the target translation format and vice versa.
 */
export interface TranslationMetaFormat {
  // the actual translation key
  key: string;

  // any number of language keys with their corresponding translations
  [languageKey: string]: string;
}
