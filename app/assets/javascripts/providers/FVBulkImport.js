import RESTActions from './rest-actions'
import RESTReducers from './rest-reducers'

// Middleware
import thunk from 'redux-thunk';

/**
 * TODO:
 *	1) Define "FV_BULKIMPORT" in RestActions.
 *  2) Define "FVBulkImport" somewhere.
 *  3) Define "bulk_import_csv" somehwere.
 *  4) Look into propper Headers.
 */

const FV_BULKIMPORT_FETCH_START = "FV_BULKIMPORT_FETCH_START";
const FV_BULKIMPORT_FETCH_SUCCESS = "FV_BULKIMPORT_FETCH_SUCCESS";
const FV_BULKIMPORT_FETCH_ERROR = "FV_BULKIMPORT_FETCH_ERROR";
const DISMISS_ERROR = "DISMISS_ERROR";


// const createBulkImportId = RESTActions.fetch('FV_BULKIMPORT', 'FVBulkImport', { headers: { 'X-NXenrichers.document': 'permissions' } });
const createBulkImportId = RESTActions.fetch('FV_BULKIMPORT', 'FVBulkImport', {});

// const createBulkImportCSV = RESTActions.create('FV_BULKIMPORT', 'FVBulkImport', { headers: { 'X-NXenrichers.document': 'ancestry,media,permissions' } });
// const fetchBulkImportCSV = RESTActions.fetch('FV_BULKIMPORT', 'FVBulkImport', { headers: { 'X-NXenrichers.document': 'ancestry,media,permissions' } });
// const updateBulkImportCSV = RESTActions.update('FV_BULKIMPORT', 'FVBulkImport', { headers: { 'X-NXenrichers.document': 'ancestry,media,permissions' } });
// const deleteBulkImportCSV = RESTActions.delete('FV_BULKIMPORT', 'FVBulkImport', { headers: { 'X-NXenrichers.document': 'ancestry,media,permissions' } });

const computeBulkImportCSVFetchFactory = RESTReducers.computeFetch('bulk_import_csv');

// const actions = { createBulkImportId, createBulkImportCSV, fetchBulkImportCSV, updateBulkImportCSV, deleteBulkImportCSV };
const actions = { createBulkImportId };

//
// Uncertain about reducer naming conventions.
//

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
};

const middleware = [thunk];

export default { actions, reducers, middleware };