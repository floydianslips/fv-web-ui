import DocumentOperations from 'operations/DocumentOperations';
import DirectoryOperations from 'operations/DirectoryOperations';

export default {
	create: function(key, type, properties = {}) {
		return function create(parentDoc, docParams, file = null, timestamp) {
			return function (dispatch) {

				// timestamp specified as we can't rely on pathOrId to be unique at this point
				let pathOrId = parentDoc + '/' + docParams.name + '.' + timestamp;

			    dispatch( { type: key + '_CREATE_START', pathOrId: pathOrId } );

			    if (file) {
					return DocumentOperations.createDocumentWithBlob(parentDoc, docParams, file).then((response) => {
					dispatch( { type: key + '_CREATE_SUCCESS', message: 'Document with blob created successfully!', response: response, pathOrId: pathOrId } )
					}).catch((error) => {
						dispatch( { type: key + '_CREATE_ERROR', message: error, pathOrId: pathOrId } )
					});
			    } else {
					return DocumentOperations.createDocument(parentDoc, docParams).then((response) => {
					dispatch( { type: key + '_CREATE_SUCCESS', message: 'Document created successfully!', response: response, pathOrId: pathOrId } )
					}).catch((error) => {
						dispatch( { type: key + '_CREATE_ERROR', message: error, pathOrId: pathOrId } )
					});
				}
			}
		}
	},
	fetch: function(key, type, properties = {}) {
		return function fetch(pathOrId, messageStart = null, messageSuccess = null, messageError = null) {
			return function (dispatch) {
				dispatch( { type: key + '_FETCH_START', pathOrId: pathOrId, message: (messageStart || 'Fetch started...') } );
			    	if(key === 'FV_BULKIMPORT') {
			    		return DocumentOperations.getBulkImportId()
					    .then((response) => {
					      dispatch( { type: key + '_FETCH_SUCCESS', message: messageSuccess, response: response, pathOrId: pathOrId, success: true } )
					    }).catch((error) => {
					        dispatch( { type: key + '_FETCH_ERROR', message: (messageError || error), pathOrId: pathOrId } )
					    });
			    	}
			    	else {
			    		return DocumentOperations.getDocument(pathOrId, type, { headers: properties.headers })
					    .then((response) => {
					      dispatch( { type: key + '_FETCH_SUCCESS', message: messageSuccess, response: response, pathOrId: pathOrId } )
					    }).catch((error) => {
					        dispatch( { type: key + '_FETCH_ERROR', message: (messageError || error), pathOrId: pathOrId } )
					    });
			    	}
			}
		}
	},
	query: function(key, type, properties = {}) {
		return function query(pathOrId, queryAppend, messageStart = null, messageSuccess = null, messageError = null) {
			return function (dispatch) {

			    dispatch( { type: key + '_QUERY_START', pathOrId: pathOrId, message: (messageStart || 'Fetch started...') } );

			    	return DirectoryOperations.getDocumentByPath2(pathOrId, type, properties.queryAppend || queryAppend, { headers: properties.headers })
				    .then((response) => {
				      dispatch( { type: key + '_QUERY_SUCCESS', message: messageSuccess, response: response, pathOrId: pathOrId } )
				    }).catch((error) => {
				        dispatch( { type: key + '_QUERY_ERROR', message: (messageError || error), pathOrId: pathOrId } )
				    });
			}
		}
	},
	execute: function(key, operationName, properties = {}) {
		return function execute(pathOrId, operationParams, messageStart = null, messageSuccess = null, messageError = null) {
			return function (dispatch) {

			    dispatch( { type: key + '_EXECUTE_START', pathOrId: pathOrId, message: (messageStart || 'Fetch started...') } );

			    	return DocumentOperations.executeOperation(pathOrId, operationName, operationParams, { headers: properties.headers })
				    .then((response) => {
				      dispatch( { type: key + '_EXECUTE_SUCCESS', message: messageSuccess, response: response, pathOrId: pathOrId } )
				    }).catch((error) => {
				        dispatch( { type: key + '_EXECUTE_ERROR', message: (messageError || error), pathOrId: pathOrId } )
				    });
			}
		}
	},
	update: function(key, type, properties = {}, usePathAsId = true) {
		return function update(newDoc, messageStart = undefined, messageSuccess = undefined, messageError = undefined) {
			return function (dispatch) {

			    dispatch( { type: key + '_UPDATE_START', pathOrId: (usePathAsId) ? newDoc.path : newDoc.uid, message: ((messageStart === undefined) ? 'Updated started...': messageStart) } );

			    return DocumentOperations.updateDocument(newDoc, { headers: properties.headers })
			      .then((response) => {
			        dispatch( { type: key + '_UPDATE_SUCCESS', message: ((messageSuccess === undefined) ? 'Document updated successfully!': messageSuccess), response: response, pathOrId: (usePathAsId) ? newDoc.path : newDoc.uid } )
			      }).catch((error) => {
			          dispatch( { type: key + '_UPDATE_ERROR', message: ((messageError === undefined) ? error: messageError), pathOrId: (usePathAsId) ? newDoc.path : newDoc.uid } )
			    });
			}
		}
	},
	delete: function(key, type, properties = {}) {
		return function update(pathOrId, messageStart = null, messageSuccess = null, messageError = null) {
			return function (dispatch) {

			    dispatch( { type: key + '_DELETE_START', pathOrId: pathOrId, message: (messageStart || 'Delete started...') } );

				return DocumentOperations.executeOperation(pathOrId, "Document.FollowLifecycleTransition", {'value': 'delete'})
			      .then((response) => {
			        dispatch( { type: key + '_DELETE_SUCCESS', message: (messageSuccess || 'Document deleted successfully!'), response: response, pathOrId: pathOrId } )
			      }).catch((error) => {
			          dispatch( { type: key + '_DELETE_ERROR', message: (messageError || error), pathOrId: pathOrId } )
			    });
			}
		}
	}
}
