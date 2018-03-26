import React, {Component, PropTypes} from 'react';
import t from 'tcomb-form';

import {RadioButtonGroup} from 'material-ui/lib/radio-button-group';
import {RadioButton} from 'material-ui/lib/radio-button';

function renderRadios(locals) {

  const onChange = function (value) {
    locals.onChange(value)
  };

  let radioContent;

  /*
  // Iterate Options to compose Radios
  if (locals.item.options) {
    let numOptions = locals.attrs.options.length;
    console.log('>>>> numOptions: '+ numOptions);
    for(let i in locals.attrs.options) {
      // Material UI Radio Button
      radioContent += <RadioButton value={locals.attrs.options[i].value} label={locals.attrs.options[i].text} />;
    }
  }
  */

  // Hard coded Radio Group for now...
  radioContent = (<RadioButtonGroup name="duplicateOptions" defaultSelected="duplicateAdd">
      <RadioButton value="duplicateAdd" label="Add duplicate records" />
      <RadioButton value="duplicateUpdate" label="Update duplicate records" />
      <RadioButton value="duplicateIgnore" label="Ignore duplicate records" />
    </RadioButtonGroup>);
  
  return (<div>{radioContent}</div>);

}

// const radioTemplate = t.form.Form.templates.textbox.clone({renderRadios});
const radioTemplate = t.form.Form.templates.radio.clone({renderRadios});

export default class BulkImportRadioOptionsFactory extends t.form.Component {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.state);
  }

  getLocals() {
    const locals = super.getLocals();
    return locals;
  }

  getTemplate() {
    return radioTemplate;
  }

}
