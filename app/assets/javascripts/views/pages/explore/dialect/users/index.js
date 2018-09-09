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
import Immutable, {List, Map} from 'immutable';

import classNames from 'classnames';
import provide from 'react-redux-provide';
import ConfGlobal from 'conf/local.json';
import selectn from 'selectn';

import ProviderHelpers from 'common/ProviderHelpers';
import NavigationHelpers from 'common/NavigationHelpers';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';
import Header from 'views/pages/explore/dialect/header';
import PageHeader from 'views/pages/explore/dialect/page-header';
import PageToolbar from 'views/pages/explore/dialect/page-toolbar';
import SearchBar from 'views/pages/explore/dialect/search-bar';

import Paper from 'material-ui/Paper';
import Button from '@material-ui/core/Button';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import CircularProgress from 'material-ui/CircularProgress';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Tabs, Tab } from 'material-ui/Tabs';
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';

import EditableComponent, {EditableComponentHelper} from 'views/components/Editor/EditableComponent';

import Statistics from 'views/components/Dashboard/Statistics';
import Link from 'views/components/Document/Link';

import UserListView from 'views/pages/explore/dialect/users/list-view';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
/**
 * Browse users
 */
@provide
export default class Index extends Component {

    static propTypes = {
        properties: PropTypes.object.isRequired,
        navigateTo: PropTypes.func.isRequired,
        windowPath: PropTypes.string.isRequired,
        splitWindowPath: PropTypes.array.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
        computePortal: PropTypes.object.isRequired,
        fetchPortal: PropTypes.func.isRequired,
        computeDialect2: PropTypes.object.isRequired,
        fetchDialect2: PropTypes.func.isRequired,
        computeLogin: PropTypes.object.isRequired,
        routeParams: PropTypes.object.isRequired
    };

    static contextTypes = {
        muiTheme: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);

        // Bind methods to 'this'
        ['_onNavigateRequest'].forEach((method => this[method] = this[method].bind(this)));
    }

    _onNavigateRequest(pathArray) {
        NavigationHelpers.navigateForwardReplace(this.props.splitWindowPath, pathArray, this.props.pushWindowPath);
    }

    // Fetch data on initial render
    componentDidMount() {
        this.props.fetchDialect2(this.props.routeParams.dialect_path);
        this.props.fetchPortal(this.props.routeParams.dialect_path + '/Portal');
    }

    // Refetch data on URL change
    componentWillReceiveProps(nextProps) {
        if (nextProps.windowPath !== this.props.windowPath) {
            nextProps.fetchPortal(nextProps.routeParams.dialect_path + '/Portal');
            this.fetchData(DefaultFetcherParams, nextProps);
        }
    }

    render() {

        const computeEntities = Immutable.fromJS([{
            'id': this.props.routeParams.dialect_path,
            'entity': this.props.computeDialect2
        }])

        const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path);

        return <PromiseWrapper hideFetch={true} computeEntities={computeEntities}>

            <div className={classNames('row', 'row-create-wrapper')}>
                <div className={classNames('col-xs-12', 'col-md-4', 'col-md-offset-8', 'text-right')}>
                    <AuthorizationFilter filter={{
                        permission: 'Write',
                        entity: selectn('response', computeDialect2),
                        login: this.props.computeLogin
                    }}>
                        <Button variant='raised'
                            label={intl.trans('views.pages.explore.dialect.users.create_new_user', 'Create New User', 'words')}
                            onClick={this._onNavigateRequest.bind(this, ['register'])} primary={true}/>
                    </AuthorizationFilter>
                </div>
            </div>

            <hr/>

            <div className="row">

                <div className="col-xs-12">
                    <UserListView routeParams={this.props.routeParams}/>
                </div>

            </div>

        </PromiseWrapper>;
    }
}