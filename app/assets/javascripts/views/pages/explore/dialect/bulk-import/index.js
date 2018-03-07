/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, {Component, PropTypes} from 'react';
import Immutable, { List, Map } from 'immutable';

import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import ConfGlobal from 'conf/local.json';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';
import PageDialectLearnBase from 'views/pages/explore/dialect/learn/base';

import RaisedButton from 'material-ui/lib/raised-button';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import MenuItem from 'material-ui/lib/menus/menu-item';

import CircularProgress from 'material-ui/lib/circular-progress';

/**
* Learn songs
*/
@provide
export default class PageBulkImport extends Component {

  static propTypes = {
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    fetchDialect2: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    fetchPortal: PropTypes.func.isRequired,
    computePortal: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired, 
    routeParams: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      filteredList: null,
      displayBulkImportLoading:false,
      bulkImportFormErrors:false,
      bulkImportFilePath:null,
      bulkImportFilePathError:false,
      radioDuplicateOption:'duplicateAdd',
      bulkImportState:null,
    };

    this.bulkImportStates = {
      formIdle : 'formIdle',
      uploadingCSV : 'uploadingCSV',
      validatingCSV : 'validatingCSV',
      processingCSV : 'processingCSV',
      importSuccess : 'importSuccess',
      importError : 'importError'
    };
  }

  fetchData(newProps) {
    newProps.fetchDialect2(newProps.routeParams.dialect_path);
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props);
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    if (nextProps.windowPath !== this.props.windowPath) {
      this.fetchData(nextProps);
    }
  }

  // On Choose Bulk Import File Change Event
  _onChooseFileChange(changeEvent) {
    
    // Validate File Path
    let filePathError = true;
    if(changeEvent.target.value) {
      filePathError = false;

      // Verify that path ends with '.csv'
      if(!changeEvent.target.value.endsWith('.csv')) {
        filePathError = true;
      }
    }

    this.setState({
      bulkImportFilePath:changeEvent.target.value,
      bulkImportFilePathError:filePathError
    });

  }

  // On Radio Select for Duplicate Options Change Event
  _onRadioChangeDuplicateOptions(changeEvent) {
    this.setState({
      radioDuplicateOption: changeEvent.target.value
    });
  }

  // Bulk Import Form Submit button press
  _onSubmitBulkImportForm(e) {
    e.preventDefault();

    // Verify Bulk Import File Path
    if(!this.state.bulkImportFilePath) {
      this.setState({
        bulkImportFilePathError : true
      });

      return;
    }

    // Verify Duplicate Entries Option
    let duplicateOption = this.state.radioDuplicateOption;
    if(duplicateOption !== 'duplicateAdd' && duplicateOption !== 'duplicateUpdate' && duplicateOption !== 'duplicateIgnore') {
      duplicateOption = 'duplicateAdd'; // Set default value
    }
    
    // If there are no Errors
    if(!this.state.bulkImportFilePathError) {
      this._processBulkImport(duplicateOption);
    }

  }

  _closeImportFinishedMessage() {
    
    this._clearBulkImportForm();

    this.setState({
      bulkImportState:this.bulkImportStates.formIdle
    });
  }

  // Clear/Reset the Bulk Import Form
  _clearBulkImportForm() {
    this.setState({
      radioDuplicateOption:'duplicateAdd',
      bulkImportFilePath:null,
      bulkImportFilePathError:false
    });
  }

  _processBulkImport(duplicateOption) {

    //
    // TODO: Process Bulk Import
    //
    this.setState({
      bulkImportState : this.bulkImportStates.uploadingCSV
    });


    // Clear Form for now
    // this._clearBulkImportForm();
  }


  render() {

    const computeEntities = Immutable.fromJS([{
      'id': this.props.routeParams.dialect_path,
      'entity': this.props.computeDialect2
    }])

    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

    let formStyleDisplay = 'none';
    let loadingHTML = '';

    if(this.state.bulkImportState === this.bulkImportStates.formIdle || !this.state.bulkImportState) {
      formStyleDisplay = 'block';
    }

    if(this.state.bulkImportState === this.bulkImportStates.uploadingCSV) {
      // Render Loading View with message "Uploading CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Uploading CSV file...</div>);

      // Set Timeout for next step: validatingCSV
      setTimeout(function(){ this.setState({bulkImportState:this.bulkImportStates.validatingCSV});}.bind(this), 2000);
    }

    if(this.state.bulkImportState === this.bulkImportStates.validatingCSV) {
      // Render Loading View with message "Validating CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Validating CSV file...</div>);

      // Set Timeout for next step: processingCSV
      setTimeout(function(){ this.setState({bulkImportState:this.bulkImportStates.processingCSV});}.bind(this), 2000);
    }

    if(this.state.bulkImportState === this.bulkImportStates.processingCSV) {
      // Render Loading View with message "Processing CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Processing CSV Entries...</div>);

      // Set Timeout for next step: importSuccess
      setTimeout(function(){ this.setState({bulkImportState:this.bulkImportStates.importSuccess});}.bind(this), 2000);
    }

    if(this.state.bulkImportState === this.bulkImportStates.importSuccess || this.state.bulkImportState === this.bulkImportStates.importError) {
      // Display Bulk Import Status Message.
      loadingHTML = (<div><h4 style={{'marginTop':'0'}}>Import Success</h4><div style={{'marginTop':'1.2rem'}}>• 300 new Words added.<br />• 100 Words ignored.<br /><button className="btn btn-primary" onClick={this._closeImportFinishedMessage.bind(this)} style={{'marginTop':'1.6rem'}}>Close</button></div></div>);
    }
    
    // Determine File Chooser Text Color
    let fileChooserTextColor = '#333';
    if(this.state.bulkImportFilePathError) {
      fileChooserTextColor = '#990000';
    }

    return (
      <div className="row" style={{marginBottom: '20px'}}>
        <div className={classNames('col-xs-12', 'col-md-8')}>
          
          <h1>Bulk Import</h1>
          <p style={{'marginTop':'1.8rem'}}>Submit a CSV file to Bulk Import entries into the <i>{selectn('response.title', computeDialect2)}</i> dialect.</p>
          <p style={{'marginTop':'1.8rem'}}>For more information about Bulk Importing, see our <span style={{'color':'#006699','textDecoration':'underline'}}>FirstVoices Bulk Importing Guide</span>.</p>
          <p style={{'marginTop':'1.8rem'}}>Download our <span style={{'color':'#006699','textDecoration':'underline'}}>FirstVoices Excel Templates</span> to help get started with Bulk Importing.</p>
          
          <div style={{'marginTop':'3.6rem'}}>
            <h2>Bulk Import Form</h2>
            <section style={{'backgroundColor':'#eee', 'marginTop':'1.8rem', 'padding':'1rem', 'borderRadius':'1rem', 'minHeight':'302px'}}>
              
              <form name="bulk-imports" onSubmit={this._onSubmitBulkImportForm.bind(this)} style={{'display':formStyleDisplay}}>
                <div className="form-group" style={{'margin':'0', 'color':fileChooserTextColor}}>
                  <label for="input-bulk-file">Choose CSV file</label>
                  <input type="file" name="bulkfile" id="input-bulk-file"
                    style={{'lineHeight':'0'}}
                    onChange={this._onChooseFileChange.bind(this)}
                    value={this.state.bulkImportFilePath}
                  />
                </div>
                <div className="form-group" style={{'marginTop':'2.4rem'}}>
                  <label>Duplicate Record options</label>
                  <p>What should happen when a record already exists?</p>
                  <div className="form-group" style={{'paddingLeft':'1.8rem'}}>
                    <input
                      type="radio"
                      name="duplicateAdd"
                      id="duplicateAdd"
                      value="duplicateAdd"
                      checked={this.state.radioDuplicateOption === 'duplicateAdd'}
                      onChange={this._onRadioChangeDuplicateOptions.bind(this)}
                      ref={(input) => { this.radioDuplicate = input; }}
                      style={{'position':'relative','top':'-2px'}}
                    /> - <label for="duplicateAdd">Add duplicate records</label><br />
                    <input
                      type="radio"
                      name="duplicateOption"
                      id="duplicateUpdate"
                      value="duplicateUpdate"
                      checked={this.state.radioDuplicateOption === 'duplicateUpdate'}
                      onChange={this._onRadioChangeDuplicateOptions.bind(this)}
                      ref={(input) => { this.radioDuplicate = input; }}
                      style={{'position':'relative','top':'-2px'}}
                    /> - <label for="duplicateUpdate">Update duplicate records</label><br />
                    <input
                      type="radio"
                      name="duplicateOption"
                      id="duplicateIgnore"
                      value="duplicateIgnore"
                      checked={this.state.radioDuplicateOption === 'duplicateIgnore'}
                      onChange={this._onRadioChangeDuplicateOptions.bind(this)}
                      ref={(input) => { this.radioIgnore = input; }}
                      style={{'position':'relative','top':'-2px'}}
                    /> - <label for="duplicateIgnore">Ignore duplicate records</label>
                  </div>
                </div>
                <div className="form-group" style={{'marginTop':'2.4rem', 'marginBottom':'0'}}>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>
              </form>

              {loadingHTML}

            </section>
          </div>

        </div>
      </div>
    );

  }
}
