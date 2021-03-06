import * as path from 'path';
import { JavaPropertiesParser } from './parser/properties.parser';
import { JsonParser } from './parser/json.parser';
import { FormConfigurationParser } from './parser/form.parser';
import { FormConfigurationComposer } from './composer/form.composer';
import { JsonComposer } from './composer/json.composer';
import { FileMapping, TranslationMetaFormat } from './contracts/app.contract';
import { ExcelParser } from './parser/excel.parser';
import { ExcelComposer } from './composer/excel.composer';
import { JavaPropertiesComposer } from './composer/properties.composer';

/**
 * Parses the JSON translation files in the given directory and creates an
 * Excel workbook out of it.
 *
 * @param {string} targetDirectory
 * @param {string} baseLanguage
 * @param {string} fileMappings
 */
export function createExcelFromFormConfigurationFiles(
  targetDirectory: string, baseLanguage: string, fileMappings: FileMapping[]) {
  const formConfigurationParser = new FormConfigurationParser();

  const translationObjects: TranslationMetaFormat[] =
    formConfigurationParser.parseFilesFromDirectory(targetDirectory, fileMappings);

  if (!translationObjects || translationObjects.length === 0) {
    throw Error('No form configuration files have been selected.');
  }

  new ExcelComposer().createTranslationFiles(targetDirectory, translationObjects, baseLanguage, fileMappings);
}

/**
 * Parses the Java Properties files in the given directory and creates an
 * Excel workbook out of it.
 *
 * @param {string} targetDirectory
 * @param {string} baseLanguage
 * @param {FileMapping[]} fileMappings
 */
export function createExcelFromJavaPropertiesFiles(
  targetDirectory: string, baseLanguage: string, fileMappings: FileMapping[]) {

  const javaPropertyParser = new JavaPropertiesParser();

  const translationObjects: TranslationMetaFormat[] =
    javaPropertyParser.parseFilesFromDirectory(targetDirectory, fileMappings);

  if (!translationObjects || translationObjects.length === 0) {
    throw Error('No Java properties files have been selected.');
  }

  new ExcelComposer().createTranslationFiles(targetDirectory, translationObjects, baseLanguage, fileMappings);
}

/**
 * Parses the JSON translation files in the given directory and creates an
 * Excel workbook out of it.
 *
 * @param {string} targetDirectory
 * @param {string} baseLanguage
 */
export function createExcelFromJsonTranslationFiles(targetDirectory: string, baseLanguage: string) {
  const jsonParser = new JsonParser();

  const translationObjects: TranslationMetaFormat[] =
      jsonParser.parseFilesFromDirectory(targetDirectory);

  if (!translationObjects || translationObjects.length === 0) {
    throw Error('No JSON translation files have been selected.');
  }

  new ExcelComposer().createTranslationFiles(targetDirectory, translationObjects, baseLanguage);
}

/**
 * Creates the form configuration files from the given Excel file.
 *
 * @param {string} targetDirectory
 * @param {string} excelFileName
 */
export function createFormConfigurationsFromExcel(targetDirectory: string, excelFileName: string) {
  const excelFilePath = path.join(targetDirectory, excelFileName);

  const translationObjects: TranslationMetaFormat[] =
    new ExcelParser().parseFiles([excelFilePath]);

  if (translationObjects.length === 0) {
    return;
  }

  const fileMappings = ExcelParser.extractFileMappingFromExcel(excelFilePath);

  const numberOfCreatedFormConfigurationFiles =
    new FormConfigurationComposer().createTranslationFiles(
      targetDirectory, translationObjects, undefined, fileMappings);

  console.log(`${numberOfCreatedFormConfigurationFiles} form configuration files created.`);
}

/**
 * Creates Java properties files from the given Excel file.
 *
 * @param {string} targetDirectory absolute path to the output directory
 * @param {string} excelFileName
 */
export function createJavaPropertiesFilesFromExcel(targetDirectory: string, excelFileName: string) {
  const excelFilePath = path.join(targetDirectory, excelFileName);

  const translationObjects: TranslationMetaFormat[] =
    new ExcelParser().parseFiles([excelFilePath]);

  const fileMappings = ExcelParser.extractFileMappingFromExcel(excelFilePath);

  if (translationObjects.length === 0) {
    return;
  }

  const numberOfCreatedFormConfigurationFiles =
    new JavaPropertiesComposer().createTranslationFiles(
      targetDirectory, translationObjects, undefined, fileMappings);

  console.log(`${numberOfCreatedFormConfigurationFiles} Java properties files created.`);
}

/**
 * Creates the JSON translation files from the given Excel file.
 *
 * @param {string} targetDirectory absolute path to the output directory
 * @param {string} excelFileName
 */
export function createJsonTranslationFilesFromExcel(targetDirectory: string, excelFileName: string) {
  const excelFilePath = path.join(targetDirectory, excelFileName);

  const translationObjects: TranslationMetaFormat[] =
    new ExcelParser().parseFiles([excelFilePath]);

  if (translationObjects.length === 0) {
    return;
  }

  const numberOfCreatedFormConfigurationFiles =
    new JsonComposer().createTranslationFiles(targetDirectory, translationObjects);

  console.log(`${numberOfCreatedFormConfigurationFiles} JSON translation files created.`);
}
