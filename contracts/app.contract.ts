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

/**
 * To be able to map translation keys in an Excel file to the file it
 * originated from, this mapping structure will be used an persisted to the
 * Excel file.
 */
export interface FileMapping {
  languageKey: string;
  fileName: string;
}
