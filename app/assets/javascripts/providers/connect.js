// Middleware
import thunk from 'redux-thunk';
import Request from 'request';

// Configuration
import ConfGlobal from 'conf/local.json';

// Operations
import BaseOperations from 'operations/BaseOperations';
import UserOperations from 'operations/UserOperations';

// Actions
const CONNECT = "CONNECT";

const LOGIN_START = "LOGIN_START";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_ERROR = "LOGIN_ERROR";

const LOGOUT_START = "LOGOUT_START";
const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
const LOGOUT_ERROR = "LOGOUT_ERROR";

const GET_CURRENT_USER_START = "GET_CURRENT_USER_START";
const GET_CURRENT_USER_SUCCESS = "GET_CURRENT_USER_SUCCESS";
const GET_CURRENT_USER_ERROR = "GET_CURRENT_USER_ERROR";

let isNewLoginValue = false;

/**
 * Actions: Represent that something happened
 */
const connect = function connect() {
    return function (dispatch) {
        BaseOperations.initClient();
        dispatch({type: CONNECT});
    }
}

const login = function login(username, password) {
    return function (dispatch) {

        dispatch({type: LOGIN_START});

        // TODO: Better way of handling logout. Currently the 'login' method does not invalidate an existing cookie.
        Request({url: ConfGlobal.baseURL + "logout", method: "GET"}, function (error, response, body) {
            return BaseOperations.login(username, password)
                .then((response) => {
                    dispatch({type: LOGIN_SUCCESS, user: response, isAnonymous: response.isAnonymous});
                }).catch((error) => {
                    dispatch({type: LOGIN_ERROR, error: error})
                });
        });
    }
};

const logout = function logout() {
    return function (dispatch) {

        dispatch({type: LOGOUT_START});

        // TODO: Better way of handling logout. Currently the 'login' method does not invalidate an existing cookie.
        Request({url: ConfGlobal.baseURL + "logout", method: "HEAD"}, function (error, response, body) {
            if (response.statusCode == 200) {
                dispatch({type: LOGOUT_SUCCESS, user: 'test', isAnonymous: true});
            } else {
                dispatch({type: LOGOUT_ERROR, error: error})
            }
        });
    }
};

const getCurrentUser = function getCurrentUser() {
    return function (dispatch) {

        dispatch({type: GET_CURRENT_USER_START});

        return UserOperations.getCurrentUser()
            .then((response) => {
                dispatch({type: GET_CURRENT_USER_SUCCESS, user: response, isAnonymous: response.isAnonymous});
            }).catch((error) => {
                dispatch({type: GET_CURRENT_USER_ERROR, error: error})
            });
    }
}

const actions = {connect, login, logout, getCurrentUser};

/**
 * Reducers: Handle state changes based on an action
 */
const reducers = {

    computeConnect(state = {isConnected: false}, action) {
        switch (action.type) {
            case CONNECT:
                return Object.assign({}, state, {
                    isConnected: true,
                    client: action.client
                })

        }
        return state;
    },

    computeLogin(state = {
        isFetching: false, response: {
            get: function () {
                return '';
            }
        }, success: false
    }, action) {
        switch (action.type) {

            case LOGIN_START:
                isNewLoginValue = true;
                return Object.assign({}, state, {isFetching: true, success: false, isNewLogin: isNewLoginValue});
                break;

            case LOGIN_SUCCESS:
                return Object.assign({}, state, {
                    response: action.user,
                    isFetching: false,
                    success: true,
                    isConnected: !action.isAnonymous,
                    isNewLogin: isNewLoginValue
                });
                break;

            case GET_CURRENT_USER_SUCCESS:
                let newLoginValue = isNewLoginValue;
                isNewLoginValue = false;
                return Object.assign({}, state, {
                    response: action.user,
                    isFetching: false,
                    success: true,
                    isConnected: !action.isAnonymous,
                    isNewLogin: newLoginValue
                });
                break;

            case LOGOUT_SUCCESS:
                return Object.assign({}, state, {
                    isFetching: false,
                    isError: false,
                    isConnected: false,
                    success: false,
                    response: null
                });
                break;

            case LOGIN_ERROR:
                return Object.assign({}, state, {isFetching: false, isError: true, error: action.error});
                break;

            default:
                return Object.assign({}, state, {isFetching: false});
                break;

        }
    },

    computeLogout(state = {isFetching: false, success: false}, action) {
        switch (action.type) {
            case LOGOUT_START:
                return Object.assign({}, state, {isFetching: true, success: false});
                break;

            case LOGOUT_ERROR:
                return Object.assign({}, state, {
                    isFetching: false,
                    success: false,
                    isError: true,
                    error: action.error
                });
                break;

            default:
                return Object.assign({}, state, {isFetching: false});
                break;
        }
    }
};

const middleware = [thunk];

export default {actions, reducers, middleware};
