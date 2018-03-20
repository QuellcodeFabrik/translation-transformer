/**
 * Remove all dots from the form id to not confuse it with the dots used in
 * the translation keys.
 *
 * @param {string} formId
 * @returns {string}
 */
export function normalizeFormId(formId: string): string {
  return formId.replace(/\./gi, '_');
}