/**
 * The form configuration data structure as it is being sent from the back end.
 * It contains the form element configuration and the actual schema definition.
 * While the schema always have to come from the back end, since all validation
 * rules are defined in there, the form element configuration could also reside
 * in the front end.
 */
export interface FormConfiguration {
  id: string;
  formElementConfigurations: FormElement[];
  schema: any;
}

export interface FormElement {
  key: string;
  type: string;
  title?: string;
  titleMap?: TitleMap[];
  validationMessage?: { [index: string]: string };
}

export interface TitleMap {
  name: string;
  value: any;
}
