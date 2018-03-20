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