import React, {Component} from 'react';
import PropTypes from 'prop-types';
import t from 'tcomb-form';
import classNames from 'classnames';
import ReactQuill from 'react-quill'

/**
* Custom textarea field for tcomb-form that uses alloy-editor
*/
function renderTextarea(locals) {

  const onContentChange = function (value) {
    locals.onChange(value);
  }

  return (
    <ReactQuill 
      value={locals.value}
      onChange={onContentChange}
    />
  )
}

const textboxTemplate = t.form.Form.templates.textbox.clone({ renderTextarea })

export default class WysiwygFactory extends t.form.Textbox {

  getTemplate() {
    return textboxTemplate
  }

}