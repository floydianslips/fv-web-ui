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
import Immutable, {List, Map} from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';
import t from 'tcomb-form';
import {User} from 'nuxeo';

import ProviderHelpers from 'common/ProviderHelpers';
import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import RaisedButton from 'material-ui/RaisedButton';

import fields from 'models/schemas/fields';
import options from 'models/schemas/options';
import IntlService from "views/services/intl";

const intl = IntlService.instance;
/**
 * Create user entry
 */
@provide
export default class Register extends Component {

    static propTypes = {
        windowPath: PropTypes.string.isRequired,
        splitWindowPath: PropTypes.array.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
        replaceWindowPath: PropTypes.func.isRequired,
        fetchDialect2: PropTypes.func.isRequired,
        computeDialect2: PropTypes.object.isRequired,
        inviteUser: PropTypes.func.isRequired,
        computeUserInvite: PropTypes.object.isRequired,
        computeUser: PropTypes.object.isRequired,
        computeLogin: PropTypes.object.isRequired,
        routeParams: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            formValue: null,
            userRequest: null
        };

        // Bind methods to 'this'
        ['_onRequestSaveForm'].forEach((method => this[method] = this[method].bind(this)));
    }

    fetchData(newProps) {
        if (newProps.routeParams.hasOwnProperty('dialect_path')) {
            newProps.fetchDialect2(newProps.routeParams.dialect_path);
        }
    }

    // Fetch data on initial render
    componentDidMount() {
        this.fetchData(this.props);
    }

    // Refetch data on URL change
    componentWillReceiveProps(nextProps) {

        let currentWord, nextWord;

        if (this.state.userRequest != null) {
            currentWord = ProviderHelpers.getEntry(this.props.computeUserInvite, this.state.userRequest);
            nextWord = ProviderHelpers.getEntry(nextProps.computeUserInvite, this.state.userRequest);
        }

        if (nextProps.windowPath !== this.props.windowPath) {
            this.fetchData(nextProps);
        }

        // 'Redirect' on success
        if (selectn('success', currentWord) != selectn('success', nextWord) && selectn('success', nextWord) === true) {
            //nextProps.replaceWindowPath('/' + nextProps.routeParams.theme + selectn('response.path', nextWord).replace('Dictionary', 'learn/words'));
        }
    }

    shouldComponentUpdate(newProps, newState) {

        switch (true) {
            case (newProps.windowPath != this.props.windowPath):
                return true;
                break;

            case (newProps.computeDialect2 != this.props.computeDialect2):
                return true;
                break;

            case (newProps.computeUserInvite != this.props.computeUserInvite):
                return true;
                break;
        }

        return false;
    }

    _onRequestSaveForm(currentUser, e) {

        // Prevent default behaviour
        e.preventDefault();

        let formValue = this.refs["form_user_create"].getValue();

        let properties = {};

        for (let key in formValue) {
            if (formValue.hasOwnProperty(key) && key) {
                if (formValue[key] && formValue[key] != '') {
                    properties[key] = formValue[key];
                }
            }
        }

        this.setState({
            formValue: properties
        })

        let payload = Object.assign({}, properties, {
            'userinfo:groups': [properties['userinfo:groups']]
        });

        // Passed validation
        if (formValue) {
            let userRequest = {
                "entity-type": "document",
                "type": "FVUserRegistration",
                "id": selectn('userinfo:email', properties),
                "properties": payload
            };

            this.props.inviteUser(userRequest, null, null, intl.trans('views.pages.users.register.user_request_success', 'User request submitted successfully!'));
            this.setState({userRequest});

        } else {
            window.scrollTo(0, 0);
        }

    }

    render() {
        let FVUserFields = selectn("FVUser", fields);
        let FVUserOptions = Object.assign({}, selectn("FVUser", options));

        console.debug(FVUserFields);
        console.debug(FVUserOptions);

        const computeEntities = ProviderHelpers.toJSKeepId([{
            'id': this.state.userRequest,
            'entity': this.props.computeUserInvite,
        }, {
            'id': this.props.routeParams.dialect_path,
            'entity': this.props.computeDialect2
        }])

        const computeUserInvite = ProviderHelpers.getEntry(this.props.computeUserInvite, this.state.userRequest);
        const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

        // Hide requested space field is pre-set.
        if (selectn("fields.fvuserinfo:requestedSpace", FVUserOptions) && selectn('response.uid', computeDialect2)) {
            FVUserOptions['fields']['fvuserinfo:requestedSpace']['type'] = 'hidden';
        }

        let dialectGroups = ProviderHelpers.getDialectGroups(selectn('response.contextParameters.acls[0].aces', computeDialect2));

        if (dialectGroups.all != null) {
            FVUserFields['userinfo:groups'] = t.enums(dialectGroups.all);
            FVUserOptions['fields']['userinfo:groups'] = {
                label: intl.trans('group', 'Group', 'first')
            };
        }

        return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>

            <h1>{selectn('response.title', computeDialect2)} {intl.trans('register', 'Register', 'first')}</h1>

            <div className="row" style={{marginTop: '15px'}}>
              <p style={{padding: '15px'}}>We are working on fixing some problems with registration of new users.<br/>To register in the meantime, please email alex@fpcc.ca.</p>
            </div>

            <div className="row" style={{marginTop: '15px', display: 'none'}}>

                <div className={classNames('col-xs-8', 'col-md-10')}>
                    <form onSubmit={this._onRequestSaveForm.bind(this, this.props.computeLogin)}>
                        <t.form.Form
                            ref="form_user_create"
                            type={t.struct(FVUserFields)}
                            context={selectn('response', computeDialect2)}
                            value={this.state.formValue || {'fvuserinfo:requestedSpace': selectn('response.uid', computeDialect2)}}
                            options={FVUserOptions}/>
                        <div className="form-group">
                            <button type="submit"
                                    className="btn btn-primary">{intl.trans('save', 'Save', 'first')}</button>
                        </div>
                    </form>

                </div>

            </div>

        </PromiseWrapper>;
    }
}