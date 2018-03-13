import React, {Component, PropTypes} from 'react';
import t from 'tcomb-form';

import {RadioButtonGroup} from 'material-ui/lib/radio-button-group';
import {RadioButton} from 'material-ui/lib/radio-button';

// import DirectoryList from 'views/components/Editor/DirectoryList';
// import QueryList from 'views/components/Editor/QueryList';

function renderRadios(locals) {

  const onChange = function (value) {
    locals.onChange(value)
  };

  let content;
  let renderError = false;
  let renderErrorMessage = '';
  let radioElementsName;
  let defaultValue;

  if(!locals.attrs.elementName) {
    renderError = true;
    renderErrorMessage = 'elementName field';
  }

  if(!locals.attrs.options) {
    renderError = true;
    if(renderErrorMessage !== '') {

    }
    else {
      renderErrorMessage = ' and options field';  
    }
    renderErrorMessage = 'options field';
  }

  if(renderError) {
    return (<div>Unable to render Radio Inputs.<br />Reason: missing {renderErrorMessage}</div>);
  }

  // Capture Radio Element Name and Default Value
  radioElementsName = locals.attrs.elementName;
  defaultValue = locals.attrs.defaultValue;

  // Iterate Options to compose Radios
  if (locals.item.options) {
    let numOptions = locals.attrs.options.length;
    for(let i in locals.attrs.options) {
      // Plain HTML Radio Input
      content += (<div style={{'backgroundColor':'#66ffff'}}><input type="radio" name={radioElementsName} id={locals.attrs.options[i].value} value={locals.attrs.options[i].value} /> - <label for={locals.attrs.options[i].value}>{locals.attrs.options[i].label}</label></div>);
      
      // Material UI Radio Group
      //content += <RadioButton value={locals.attrs.options[i].value} label={locals.attrs.options[i].label} />;
    }
  }

  // Material UI Radio Group
  // content += (<RadioButtonGroup name={radioElementsName} defaultSelected={defaultValue}>{content}</RadioButtonGroup>);

  // return <div><RadioButtonGroup name={radioElementsName} defaultSelected={defaultValue}>{content}</RadioButtonGroup></div>;
  return <div>{content}</div>;
}


const radioTemplate = t.form.Form.templates.textbox.clone({renderRadios});
// const radioTemplate = t.form.Form.templates.radio.clone({renderRadios});

// export default class BulkImportRadioOptionsFactory extends t.form.Radio {
export default class BulkImportRadioOptionsFactory extends t.form.Textbox {
  // Need some help here. Don't like what's happening with "extends t.form.Textbox"

  constructor(props) {
    super(props);
    this.state = Object.assign(this.state);
  }

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();

    return locals;
  }

  getTemplate() {
    return radioTemplate;
  }
}