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
import t from 'tcomb-form';

import ConfGlobal from 'conf/local.json';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';
import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';

import fields from 'models/schemas/fields';
import options from 'models/schemas/options';

const defaultFormValues = {'file:content': {}, 'bulkImportRadioOptions':'duplicateAdd'};

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
    createBulkImportId: PropTypes.func.isRequired,
    computeCreateBulkImportId: PropTypes.object.isRequired,
    createBulkImportCSV: PropTypes.func.isRequired,
    computeCreateBulkImportCSV: PropTypes.object.isRequired,
    processBulkImportCSV : PropTypes.func.isRequired,
    computeProcessBulkImportCSV: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      filteredList: null,
      formValue: defaultFormValues,
      bulkImportFormSubmitErrorMessage:null,
      bulkImportFormErrors:false,
      bulkImportProcessErrorMessage:null,
      bulkImportState:null,
      displayBulkImportLoading:false,
      bulkImportBatchId: null,
    };

    this.bulkImportStates = {
      formIdle : 'formIdle',
      fetchBatchId : 'fetchBatchId',
      uploadingCSV : 'uploadingCSV',
      validatingCSV : 'validatingCSV',
      processingCSV : 'processingCSV',
      importSuccess : 'importSuccess',
      importError : 'importError'
    };

    this.isProcessingCSV = false;
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

    // If in the Uploading CSV State
    if(this.state.bulkImportState === this.bulkImportStates.uploadingCSV) {

      if(nextProps.computeCreateBulkImportCSV !== this.props.computeCreateBulkImportCSV) {
      
        // If CSV File Uploaded Successfully
        if(!nextProps.computeCreateBulkImportCSV.isFetching && nextProps.computeCreateBulkImportCSV.success) {

          // Start Processing the Bulk Import Form
          this._processBulkImport(nextProps.computeCreateBulkImportCSV.data);

        }
        else if(!nextProps.computeCreateBulkImportCSV.isFetching && !nextProps.computeCreateBulkImportCSV.success) {
          
          // If there was an Error Uploading the CSV File

          console.log('There was an error Uploading the CSV file.');

          //
          // TODO: Display Error View to user
          //

        }

      }

    }
    // Else If in the Processing CSV State
    else if(this.state.bulkImportState === this.bulkImportStates.processingCSV) {

      if(nextProps.computeProcessBulkImportCSV !== this.props.computeProcessBulkImportCSV) {
      

        // If CSV File Processed Successfully
        if(!nextProps.computeProcessBulkImportCSV.isFetching && nextProps.computeProcessBulkImportCSV.success) {

          // Update State
          this.setState({ bulkImportState:this.bulkImportStates.importSuccess });


        }
        else if(!nextProps.computeProcessBulkImportCSV.isFetching && !nextProps.computeProcessBulkImportCSV.success) {
          
          // If there was an Error processing the CSV File

          console.log('There was an error Processing the CSV file:');
          console.log(nextProps.computeProcessBulkImportCSV.error);

          // TODO: Extract Error Message from Server
          let errorMessage = 'There was an error processing the CSV File.';
          
          // Display Error View to user
          this.setState({
            bulkImportState:this.bulkImportStates.importError,
            bulkImportProcessErrorMessage: errorMessage
          });

        }

      }
    }
    
  }


  _validateBulkImportForm(formProperties) {

    let formErrors = [];

    if(!formProperties['file:content']) {
      formErrors.push(<li key="error1">Please choose a CSV file.</li>);
    }
    else if(!formProperties['file:content'].name.length) {
      formErrors.push(<li key="error2">Please choose a CSV file.</li>);
    }
    else if(!formProperties['file:content'].name.endsWith('.csv')) {
      formErrors.push(<li key="error3">File must be a CSV file.</li>);
    }

    //
    // TODO: Process Duplicate Records option
    //

    // Skip Duplicate Entry for now
    if(!formProperties['bulkImportRadioOptions']) {
      formErrors.push(<li key="error4">Please choose a Duplicate Record Option.</li>);
    }

    return formErrors;

  }


  _onSubmitBulkImportForm(e) {
    e.preventDefault();

    // Reset Form Errors
    this.setState({
      'bulkImportFormSubmitErrorMessage':null
    });

    // Get Bulk Import Form Values
    let formValue = this.refs["form_bulk_import"].getValue();

    // Capture Form Properties
    let formProps = {};
    for (let key in formValue) {
      if (formValue.hasOwnProperty(key) && key) {
        if (formValue[key] && formValue[key] != '') {
          formProps[key] = formValue[key];
        }
      }
    }

    let formErrors = this._validateBulkImportForm(formProps);
    let errorStateValue = false;
    if(formErrors.length) {
      errorStateValue = true;
    }

    this.setState({
      'bulkImportFormErrors2':errorStateValue,
      'bulkImportFormSubmitErrorMessage': formErrors,
      'formValue': formProps
    });

    // Hault if there are Errors
    if(errorStateValue) {
      return;
    }

    // If bulkImportRadioOptions is not set, set default value
    if(!formProps['bulkImportRadioOptions']) {
      formProps['bulkImportRadioOptions'] = 'duplicateAdd';
    }

    this._uploadBatchImportCSV(formProps);

    // Update Bulk Import State to FetchBatchId
    this.setState({
      bulkImportState : this.bulkImportStates.uploadingCSV
    });

  }


  _closeImportFinishedMessage() {
    
    this._clearBulkImportForm();

    this.setState({
      'bulkImportState':this.bulkImportStates.formIdle,
      'bulkImportProcessErrorMessage':null,
    });
  }


  // Clear/Reset the Bulk Import Form
  _clearBulkImportForm() {

    this.setState({
      'radioDuplicateOption':'duplicateAdd',
      'bulkImportFilePath':null,
      'bulkImportFilePathError':false,
      'bulkImportFormErrors2': false,
      'formValue': defaultFormValues
    });

  }


  // Upload a CSV file to be used for Batch Import
  _uploadBatchImportCSV(formProps) {

    // Find DuplicateEntyOption
    let duplicateOption = formProps['bulkImportRadioOptions'];
    if(!duplicateOption) {
      duplicateOption = 'duplicateAdd';
    }

    // Set up and process File Form Data object
    let file;
    let fd = new FormData();
    for (let k in formProps) {
      let v = formProps[k];
      if (t.form.File.is(v)) {
        fd.append(k, v, v.name);
        file = v;
      } else {
        fd.append(k, v);
      }
    }

    // If File exists
    if(file) {
      
      // Path for Upload
      let uploadPath = '/FV/Workspaces/BulkImportDocs/BulkImportResources';

      let dialect = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);
      let dialectUid = dialect.response.uid;

      let docDescription = {
        dialectUid : dialectUid,
        duplicateOption : duplicateOption
      };

      let properties = {};

      for (let key in formProps) {
        if (formProps.hasOwnProperty(key) && key && key != 'file') {
          if (formProps[key] && formProps[key] != '') {
            properties[key] = formProps[key];
          }
        }
      }

      // Timestamp
      let timestamp = Date.now();

      // Set Document Parameters
      let docParams = {
        dialect: this.props.routeParams['language_name'],
        description: docDescription
      };

      // Upload Bulk Import CSV, and attach CSV to New Document
      this.props.createBulkImportCSV(uploadPath, docParams, file, timestamp);

    }

  }


  _processBulkImport(csvProps) {


    // Prevent Multiple calls. This might be because a Rest Action is not being used.
    if (this.state.bulkImportState === this.bulkImportStates.uploadingCSV) {
    
      const dialect = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);
      
      // csvProps.response.uid
      let dialectUid = dialect.response.uid;
      let csvPath = csvProps.response.path;
      let csvUid = csvProps.response.uid;
      let duplicateEntryOption = this.state.formValue.bulkImportRadioOptions;

      let operationParams = {
        dialectUid: "doc:"+ dialectUid,
        csvUid: "doc:"+ csvUid,
        duplicateEntryOption:duplicateEntryOption
      };

      // Request to Execute Service for Processing Bulk Import CSV File
      this.props.processBulkImportCSV(csvPath, operationParams, null, operationParams, "Processing CSV File success. Maybe.");
      
      // Update State
      this.setState({ bulkImportState:this.bulkImportStates.processingCSV });
    }
  }


  render() {

    const computeEntities = Immutable.fromJS([{
      'id': this.props.routeParams.dialect_path,
      'entity': this.props.computeDialect2
    }])

    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

    // Fetch Bulk Import Form Options
    let FVBulkImportCSV = Object.assign({}, selectn("FVBulkImportCSV", options));

    // If there are any Form Error Messages
    let formErrorMessage;
    if(this.state.bulkImportFormErrors2) {
      formErrorMessage = (
        <div style={{'color':'#990000','border':'1px solid #990000', 'padding':'1rem', 'backgroundColor':'#ffcccc', 'marginBottom':'2.2rem'}}>
          <p style={{'marginBottom':'0'}}>Form Error:</p>
          <ul style={{padding:'0 0 0 3.2rem', 'marginBottom':'0'}}>
            {Object.values(this.state.bulkImportFormSubmitErrorMessage)}
          </ul>
        </div>
      );
    }

    let bulkImportProcessingError;
    let formStyleDisplay = 'none';
    let loadingHTML = '';

    if(this.state.bulkImportState === this.bulkImportStates.formIdle || !this.state.bulkImportState) {
      formStyleDisplay = 'block';
    }
    
    if(this.state.bulkImportState === this.bulkImportStates.fetchBatchId) {
      // Render Loading View with message "Uploading CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Preparing Bulk Import... {this.state.bulkImportBatchId}</div>);
    }

        
    if(this.state.bulkImportState === this.bulkImportStates.uploadingCSV) {
      // Render Loading View with message "Uploading CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Uploading CSV file... {this.state.bulkImportBatchId}</div>);
    }

    if(this.state.bulkImportState === this.bulkImportStates.validatingCSV) {
      // Render Loading View with message "Validating CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Validating CSV file...</div>);

      // Set Timeout for next step: processingCSV
      // setTimeout(function(){ this.setState({bulkImportState:this.bulkImportStates.processingCSV});}.bind(this), 500);
    }

    if(this.state.bulkImportState === this.bulkImportStates.processingCSV) {
      // Render Loading View with message "Processing CSV"
      loadingHTML = (<div><CircularProgress mode="indeterminate" style={{verticalAlign: 'middle'}} size={1} /> Processing CSV Entries...</div>);

      // Set Timeout for next step: importSuccess
      // setTimeout(function(){ this.setState({bulkImportState:this.bulkImportStates.importSuccess});}.bind(this), 500);
    }

    if(this.state.bulkImportState === this.bulkImportStates.importSuccess) {
      // Display Bulk Import Status Message.
      loadingHTML = (<div><h4 style={{'marginTop':'0'}}>Import Success</h4><div style={{'marginTop':'1.2rem'}}>• 300 new Words added.<br />• 100 Words ignored.<br /><button className="btn btn-primary" onClick={this._closeImportFinishedMessage.bind(this)} style={{'marginTop':'1.6rem'}}>Close</button></div></div>);
    }

    if(this.state.bulkImportState === this.bulkImportStates.importError) {

      let processingErrorMessage = this.state.bulkImportProcessErrorMessage;

      // Display Bulk Import Status Message.
      loadingHTML = (<div><h4 style={{'marginTop':'0'}}>Error Processing CSV File</h4><div style={{'marginTop':'1.2rem'}}>• {processingErrorMessage}<br /><button className="btn btn-primary" onClick={this._closeImportFinishedMessage.bind(this)} style={{'marginTop':'1.6rem'}}>Close</button></div></div>);
    }

    return (
      <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>
        <div className="row" style={{marginBottom: '20px'}}>
          <div className={classNames('col-xs-12', 'col-md-8')}>

            <h1>Bulk Import</h1>
            <p style={{'marginTop':'1.8rem'}}>Submit a CSV file to Bulk Import entries into the <i>{selectn('response.title', computeDialect2)}</i> dialect.</p>
            <p style={{'marginTop':'1.8rem'}}>For more information about Bulk Importing, see our <span style={{'color':'#006699','textDecoration':'underline'}}>FirstVoices Bulk Importing Guide</span>.</p>
            <p style={{'marginTop':'1.8rem'}}>Download our <span style={{'color':'#006699','textDecoration':'underline'}}>FirstVoices Excel Templates</span> to help get started with Bulk Importing.</p>
            
            <h2 style={{'marginBottom':'2.4rem'}}>Bulk Import Form</h2>
            <div style={{'marginTop':'1.4rem','padding':'1rem','backgroundColor':'#cfe7ff','borderRadius':'1rem','minHeight':'280px'}}>
              <div style={{'display':formStyleDisplay}}>
                {formErrorMessage}
                <form onSubmit={this._onSubmitBulkImportForm.bind(this)}>
                  <t.form.Form
                    ref="form_bulk_import"
                    type={t.struct(selectn("FVBulkImportCSV", fields))}
                    context={selectn('response', computeDialect2)}
                    value={this.state.formValue}
                    options={FVBulkImportCSV}
                  />
                  <div className="form-group" style={{'marginTop':'1.2rem', 'marginBottom':'0'}}>
                    <button type="submit" className="btn btn-primary">Submit</button>
                  </div>
                </form>
              </div>

              {loadingHTML}

            </div>
          </div>
        </div>
      </PromiseWrapper>
    );

  }
}
