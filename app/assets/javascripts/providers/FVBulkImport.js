import RESTActions from './rest-actions'
import RESTReducers from './rest-reducers'

// Middleware
import thunk from 'redux-thunk';


const DISMISS_ERROR = "DISMISS_ERROR";

const FV_BULKIMPORT_FETCH_START = "FV_BULKIMPORT_FETCH_START";
const FV_BULKIMPORT_FETCH_SUCCESS = "FV_BULKIMPORT_FETCH_SUCCESS";
const FV_BULKIMPORT_FETCH_ERROR = "FV_BULKIMPORT_FETCH_ERROR";

const FV_BULKIMPORT_CREATE_START = "FV_BULKIMPORT_CREATE_START";
const FV_BULKIMPORT_CREATE_SUCCESS = "FV_BULKIMPORT_CREATE_SUCCESS";
const FV_BULKIMPORT_CREATE_ERROR = "FV_BULKIMPORT_CREATE_ERROR";

const FV_BULKIMPORT_EXECUTE_START = "FV_BULKIMPORT_EXECUTE_START";
const FV_BULKIMPORT_EXECUTE_WORKING = "FV_BULKIMPORT_EXECUTE_WORKING";
const FV_BULKIMPORT_EXECUTE_SUCCESS = "FV_BULKIMPORT_EXECUTE_SUCCESS";
const FV_BULKIMPORT_EXECUTE_ERROR = "FV_BULKIMPORT_EXECUTE_ERROR";

const createBulkImportId = RESTActions.fetch('FV_BULKIMPORT', 'FVBulkImport', {});
const createBulkImportCSV = RESTActions.create('FV_BULKIMPORT', 'FVBulkImport', {});
const processBulkImportCSV = RESTActions.execute('FV_BULKIMPORT', 'FVBulkImportProcessCSV', { headers: { 'X-NXenrichers.document': 'ancestry,dialect,permissions,acls' } });
const computeBulkImportCSVFetchFactory = RESTReducers.computeFetch('bulk_import_csv');

const actions = { createBulkImportId, createBulkImportCSV, processBulkImportCSV };


const reducers = {

  computeCreateBulkImportId(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    
    switch (action.type) {
      case FV_BULKIMPORT_FETCH_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_FETCH_SUCCESS:
        return Object.assign({}, state, { data: action, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_FETCH_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default:
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },

  computeCreateBulkImportCSV(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
  	
    switch (action.type) {
      case FV_BULKIMPORT_CREATE_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_CREATE_SUCCESS:
        return Object.assign({}, state, { data: action, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_CREATE_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
    
  },

  computeProcessBulkImportCSV(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    
    switch (action.type) {
      case FV_BULKIMPORT_EXECUTE_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_EXECUTE_SUCCESS:
        return Object.assign({}, state, { data: action, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_EXECUTE_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
    
  },

  computeExecuteOperation(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    
    switch (action.type) {
      case FV_BULKIMPORT_EXECUTE_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_EXECUTE_SUCCESS:
        return Object.assign({}, state, { data: action, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_BULKIMPORT_EXECUTE_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
    
  },

};

const middleware = [thunk];

export default { actions, reducers, middleware };