import FormType from '../classes/FormType';

/** フォーム種別 */
const FormTypes = {
  CHECKBOX: new FormType(),
  NUMBER: new FormType(),
  RADIOBUTTON: new FormType(),
  TEXT: new FormType(),
  TEXT_ARRAY: new FormType()
};

export default FormTypes;
