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
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import provide from 'react-redux-provide';
import selectn from 'selectn';

// Components
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import ActionExitToAppIcon from '@material-ui/icons/ExitToApp';

import CircularProgress from '@material-ui/core/CircularProgress';

import {BrowserView, MobileView, isBrowser, isMobile} from 'react-device-detect';
import IntlService from "views/services/intl";

@provide
export default class Login extends Component {
    intl = IntlService.instance;

    static propTypes = {
        pushWindowPath: PropTypes.func.isRequired,
        login: PropTypes.func.isRequired,
        computeLogin: PropTypes.object.isRequired,
        logout: PropTypes.func.isRequired,
        properties: PropTypes.object.isRequired,
        computeLogout: PropTypes.object.isRequired,
        label: PropTypes.string.isRequired,
        routeParams: PropTypes.object
    };

    componentDidUpdate(prevProps) {
        //if (prevProps.userStore.currentUser !== this.props.userStore.currentUser) {
        //  this._handleClose();
        //}

      this.anchorEl = ReactDOM.findDOMNode(this.anchorEl)
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            open: false,
            loginAttempted: false,
            loginAttemptCleared: false
        };

        this.anchorEl = null;

        ['_handleOpen', '_handleClose', '_handleLogin', '_handleLogout', '_onNavigateRequest'].forEach((method => this[method] = this[method].bind(this)));
    }

    _handleOpen(event) {

        event.preventDefault();

        if (isMobile) {
            this._onNavigateRequest("login");
            return;
        }

        this.setState({
            open: true
        });
    }

    _handleClose() {
        this.setState({
            open: false
        });
    }

    _handleLogin() {
        // This should be handled with state, not refs
        let username = this.usernameRef.value;
        let password = this.passwordRef.value;

        if (username !== null && password !== null) {
            if (username.length > 0 && password.length > 0) {

                // console.log('About to attempt login, desktop.');

                this.setState({loginAttempted: true});
                this.props.login(username, password);
            }
        }

        this._handleClose();
    }

    _handleLogout() {
        this.setState({loginAttempted: false});
        this.props.logout();
    }

    _onNavigateRequest(path) {

        let dest = '/' + path + '/';

        if (selectn("routeParams.dialect_path", this.props) && path === 'register') {
            dest = '/explore' + this.props.routeParams.dialect_path + '/' + path;
        }

        this._handleClose();
        this.props.pushWindowPath(dest);
    }

    render() {

        const themePalette = this.props.properties.theme.palette.palette;
        const TextFieldStyle = {
            border: '1px solid',
            borderColor: '#a2291d',
            width: '100%',
            paddingLeft: '5px',
            height: '34px',
            lineHeight: '10px',
            fontSize: '14px'
        };

        let loginFeedbackMessage = "";

        if (this.props.computeLogin.isFetching || this.props.computeLogout.isFetching) {
            return <div style={{display: "inline-block", paddingRight: "10px", color: '#fff'}}>{this.intl.translate({
                key: 'views.components.navigation.processing_request',
                default: 'Processing request',
                case: 'first'
            })}...</div>;
        }

        // Handle success (anonymous or actual)
        if (this.props.computeLogin.success && this.props.computeLogin.isConnected) {
            return (
                <div className="hidden-xs" style={{display: "inline-block", paddingRight: '15px'}}>
                    {this.intl.translate({key: 'general.welcome', default: 'WELCOME', case: 'upper'})}, <a
                    style={{color: '#fff', textTransform: 'uppercase', cursor: 'pointer'}}
                    onClick={this._onNavigateRequest.bind(this, 'profile')}>{selectn("response.properties.firstName", this.props.computeLogin)}</a>
                </div>
            );
        } else {
            if (this.state.loginAttempted) {
                loginFeedbackMessage = this.intl.translate({
                    key: 'pages.users.login.incorrect_username_password',
                    default: 'Username or password incorrect',
                    case: 'first'
                });
                if (this.props.computeLogin.isError) {
                    loginFeedbackMessage = this.props.computeLogin.error;
                }
            }
        }

        return (
            <div style={{display: "inline-block", maxWidth: '205px'}}>
                <Button variant='flat' ref={(el) => {
                    this.anchorEl = el
                }} style={{"color": themePalette.alternateTextColor}}
                            onClick={this._handleOpen}>{this.props.label}</Button>
                <Popover open={this.state.open}
                         anchorEl={this.anchorEl}
                         style={{marginTop: "-14px", "backgroundColor": "transparent", "boxShadow": "none"}}
                         anchorOrigin={{"horizontal": "left", "vertical": "bottom"}}
                         transformOrigin={{"horizontal": "center", "vertical": "top"}}
                         onClose={this._handleClose}>
                    <div style={{"width": "205px"}}>
                        <img style={{"position": "relative", "top": "14px", "zIndex": "999999", "left": "65%"}}
                             src="/assets/images/popover-arrow.png" alt=""/>
                        <div style={{"backgroundColor": "#fff", "padding": "10px", "width": "100%"}}>
                            <h6>{this.intl.translate({
                                key: 'views.pages.users.login.sign_in_below',
                                default: 'Sign in Below',
                                case: 'first'
                            })} <a style={{"cursor": "pointer", "fontWeight": "100"}}
                                   onClick={this._onNavigateRequest.bind(this, "forgotpassword")}
                                   className="pull-right">{this.intl.translate({
                                key: 'general.forgot?',
                                default: 'Forgot?',
                                case: 'first'
                            })}</a></h6>
                            <div><TextField style={Object.assign({}, TextFieldStyle, {"margin": "15px 0"})}
                                            InputProps={{disableUnderline:true}} inputRef={el => this.usernameRef = el} placeholder={this.intl.translate({
                                key: 'views.pages.explore.dialect.users.username',
                                default: 'Username',
                                case: 'first'
                            })}/></div>
                            <div><TextField style={TextFieldStyle} InputProps={{disableUnderline:true}} inputRef={el => this.passwordRef = el} type="password"
                                            placeholder={this.intl.translate({
                                                key: 'general.password',
                                                default: 'Password',
                                                case: 'first'
                                            })}/></div>
                            <p style={{
                                "margin": "10px 0",
                                "fontSize": "12px",
                                "backgroundColor": themePalette.primary4ColorLightest,
                                "padding": "0 3px"
                            }}>{loginFeedbackMessage}</p>
                            <Button variant='raised' style={{"width": "100%"}} color="secondary" onClick={this._handleLogin}>
                                {this.intl.translate({
                                    key: 'views.pages.users.login.sign_in',
                                    default: 'Sign In',
                                    case: 'first'
                                })}
                            </Button>
                            <h6 style={{"fontWeight": "500", "paddingTop": "10px"}}>{this.intl.translate({
                                key: 'views.components.navigation.new_to_firstvoices',
                                default: 'New to FirstVoices?'
                            })}</h6>
                            <Button variant='raised' style={{"width": "100%"}} color="primary"
                                          onClick={this._onNavigateRequest.bind(this, "register")}>
                                {this.intl.translate({
                                    key: 'general.register',
                                    default: 'Register',
                                    case: 'first'
                                })}              
                            </Button>
                        </div>
                    </div>
                </Popover>
            </div>
        );
    }
}
