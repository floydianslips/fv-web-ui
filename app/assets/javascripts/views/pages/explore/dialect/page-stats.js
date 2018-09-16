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
import ConfGlobal from 'conf/local.json';
import selectn from 'selectn';

import provide from 'react-redux-provide';

import ProviderHelpers from 'common/ProviderHelpers';

import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';
import Toggle from 'material-ui/Toggle';
import IconMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import NavigationExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'; 
import Statistics from 'views/components/Dashboard/Statistics';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';

import IntlService from 'views/services/intl';

const intl = IntlService.instance;

@provide
export default class PageStats extends Component {

    static propTypes = {
        windowPath: PropTypes.string.isRequired,
        handleNavigateRequest: PropTypes.func,
        computeDialectStats: PropTypes.object.isRequired,
        dialectPath: PropTypes.string.isRequired
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
          tabValue: 0,
        };

        [].forEach((method => this[method] = this[method].bind(this)));
    }

    render() {
        const computeDialectStats = ProviderHelpers.getEntry(this.props.computeDialectStats, this.props.dialectPath);

        if (!selectn('response', computeDialectStats)) {
            return <div>Loading...</div>;
        }

        return <div>
          <Tabs value={this.state.tabValue} onChange={(e, tabValue) => this.setState({ tabValue })}>
            <Tab label="Words" id="statisticsWords" />
            <Tab label="Phrases" id="statisticsPhrases" />
            <Tab label="Songs" id="statisticsSongs" />
            <Tab label="Stories" id="statisticsStories" />
          </Tabs>
          {this.state.tabValue === 0 && (
            <Typography component="div" style={{ padding: 8 * 3 }}>
              <Paper style={{padding: '15px'}} zDepth={2}>
                <Statistics data={selectn('response', computeDialectStats)} docType="words"
                            headerText={intl.trans('words', 'Words', 'first')}/>
              </Paper>
            </Typography>
          )}
          {this.state.tabValue === 1 && (
            <Typography component="div" style={{ padding: 8 * 3 }}>
              <Paper style={{padding: '15px'}} zDepth={2}>
                <Statistics data={selectn('response', computeDialectStats)} docType="phrases"
                            headerText={intl.trans('phrases', 'Phrases', 'first')}/>
              </Paper>
            </Typography>
          )}
          {this.state.tabValue === 2 && (
            <Typography component="div" style={{ padding: 8 * 3 }}>
              <Paper style={{padding: '15px'}} zDepth={2}>
                <Statistics data={selectn('response', computeDialectStats)} docType="songs"
                            headerText={intl.trans('songs', 'Songs', 'first')}/>
              </Paper>
            </Typography>
          )}
          {this.state.tabValue === 3 && (
            <Typography component="div" style={{ padding: 8 * 3 }}>
              <Paper style={{padding: '15px'}} zDepth={2}>
                <Statistics data={selectn('response', computeDialectStats)} docType="stories"
                            headerText={intl.trans('stories', 'Stories', 'first')}/>
              </Paper>
            </Typography>
          )}
        </div>;
        
          

    }
}
