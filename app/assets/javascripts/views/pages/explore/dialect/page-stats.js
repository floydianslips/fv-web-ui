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

import Paper from 'material-ui/Paper';

import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import Button from '@material-ui/core/Button';
import Toggle from 'material-ui/Toggle';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import NavigationExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Tabs, Tab } from 'material-ui/Tabs';
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

        [].forEach((method => this[method] = this[method].bind(this)));
    }

    render() {
        const computeDialectStats = ProviderHelpers.getEntry(this.props.computeDialectStats, this.props.dialectPath);

        if (!selectn('response', computeDialectStats)) {
            return <div>Loading...</div>;
        }

        return <Tabs>
            <Tab label="Words" id="statisticsWords">
                <Paper style={{padding: '15px'}} zDepth={2}>
                    <Statistics data={selectn('response', computeDialectStats)} docType="words"
                                headerText={intl.trans('words', 'Words', 'first')}/>
                </Paper>
            </Tab>

            <Tab label="Phrases" id="statisticsPhrases">
                <Paper style={{padding: '15px'}} zDepth={2}>
                    <Statistics data={selectn('response', computeDialectStats)} docType="phrases"
                                headerText={intl.trans('phrases', 'Phrases', 'first')}/>
                </Paper>
            </Tab>

            <Tab label="Songs" id="statisticsSongs">
                <Paper style={{padding: '15px'}} zDepth={2}>
                    <Statistics data={selectn('response', computeDialectStats)} docType="songs"
                                headerText={intl.trans('songs', 'Songs', 'first')}/>
                </Paper>
            </Tab>

            <Tab label="Stories" id="statisticsStories">
                <Paper style={{padding: '15px'}} zDepth={2}>
                    <Statistics data={selectn('response', computeDialectStats)} docType="stories"
                                headerText={intl.trans('stories', 'Stories', 'first')}/>
                </Paper>
            </Tab>
        </Tabs>;

        /*return <Toolbar>

                      <ToolbarGroup float="left">

                        {this.props.children}

                        {(() => {
                          if (this.props.actions.includes('workflow')) {

                              return <AuthorizationFilter filter={{role: 'Record', entity: selectn('response', permissionEntity), login: computeLogin}} style={toolbarGroupItem}>

                                <div>

                                  <span style={{paddingRight: '15px'}}>REQUEST: </span>

                                  <Button variant='raised' label={"Enable (" + (enableTasks.length + this.state.enableActions ) + ")"} disabled={selectn('response.state', computeEntity) != 'Disabled' && selectn('response.state', computeEntity) != 'New'} style={{marginRight: '5px', marginLeft: '0'}} color="secondary" onClick={this._documentActionsStartWorkflow.bind(this, 'enable')} />
                                  <Button variant='raised' label={"Disable (" + (disableTasks.length + this.state.disableActions) + ")"} disabled={selectn('response.state', computeEntity) != 'Enabled' && selectn('response.state', computeEntity) != 'New'} style={{marginRight: '5px', marginLeft: '0'}} color="secondary" onClick={this._documentActionsStartWorkflow.bind(this, 'disable')} />
                                  <Button variant='raised' label={"Publish (" + (publishTasks.length + this.state.publishActions) + ")"} disabled={selectn('response.state', computeEntity) != 'Enabled'} style={{marginRight: '5px', marginLeft: '0'}} color="secondary" onClick={this._documentActionsStartWorkflow.bind(this, 'publish')} />
                                  <Button variant='raised' label={"Unpublish (" + (unpublishTasks.length + this.state.unpublishActions) + ")"} disabled={selectn('response.state', computeEntity) != 'Published'} style={{marginRight: '5px', marginLeft: '0'}} color="secondary" onClick={this._documentActionsStartWorkflow.bind(this, 'unpublish')} />

                                </div>

                              </AuthorizationFilter>;
                          }
                        })()}


                        {(() => {
                          if (this.props.actions.includes('enable-toggle')) {

                              return <AuthorizationFilter filter={{permission: 'Write', entity: selectn('response', permissionEntity)}} style={toolbarGroupItem}>
                                <div style={{display:'inline-block', float: 'left', margin: '17px 5px 10px 5px', position:'relative'}}>
                                  <Toggle
                                    toggled={documentEnabled || documentPublished}
                                    onToggle={this._documentActionsToggleEnabled}
                                    ref="enabled"
                                    disabled={documentPublished}
                                    name="enabled"
                                    value="enabled"
                                    label="Enabled"/>
                                </div>
                              </AuthorizationFilter>;
                          }
                        })()}

                        {(() => {
                          if (this.props.actions.includes('publish-toggle')) {

                              return <AuthorizationFilter filter={{permission: 'Write', entity: selectn('response', permissionEntity)}} style={toolbarGroupItem}>
                                <div style={{display:'inline-block', float: 'left', margin: '17px 5px 10px 5px', position:'relative'}}>
                                  <Toggle
                                    toggled={documentPublished}
                                    onToggle={this._documentActionsTogglePublished}
                                    disabled={!documentEnabled && !documentPublished}
                                    name="published"
                                    value="published"
                                    label="Published"/>
                                </div>
                              </AuthorizationFilter>;
                          }
                        })()}

                      </ToolbarGroup>

                      <ToolbarGroup float="right">

                        {(() => {
                          if (this.props.actions.includes('publish')) {
                            return <AuthorizationFilter filter={{permission: 'Write', entity: selectn('response', permissionEntity)}} style={toolbarGroupItem}>
                              <Button variant='raised' data-guide-role="publish-changes" disabled={!documentPublished} label="Publish Changes" style={{marginRight: '5px', marginLeft: '0'}} color="secondary" onClick={this._publishChanges} />
                            </AuthorizationFilter>;
                          }
                        })()}

                        {(() => {
                          if (this.props.actions.includes('edit')) {
                            return <AuthorizationFilter filter={{permission: 'Write', entity: selectn('response', computeEntity)}} style={toolbarGroupItem}>
                              <Button variant='raised' label={"Edit " + this.props.label} style={{marginRight: '5px', marginLeft: '0'}} color="primary" onClick={this.props.handleNavigateRequest.bind(this, this.props.windowPath.replace('sections', 'Workspaces') + '/edit')} />
                            </AuthorizationFilter>;
                          }
                        })()}

                        {(() => {
                          if (this.props.actions.includes('add-child')) {
                            return <AuthorizationFilter filter={{permission: 'Write', entity: selectn('response', computeEntity)}} style={toolbarGroupItem}>
                                    <Button variant='raised' label="Add New Page" style={{marginRight: '5px', marginLeft: '0'}} onClick={this.props.handleNavigateRequest.bind(this, this.props.windowPath + '/create')} color="primary" />
                            </AuthorizationFilter>;
                          }
                        })()}

                        <ToolbarSeparator />

                        {(() => {
                          if (this.props.actions.includes('more-options')) {
                            return <IconMenu anchorOrigin={{horizontal: 'right', vertical: 'top'}} targetOrigin={{horizontal: 'right', vertical: 'top'}} iconButtonElement={
                                    <IconButton tooltip="More Options" tooltipPosition="top-center" touch={true}>
                                      <NavigationExpandMoreIcon />
                                    </IconButton>
                                  }>
                                    <MenuItem onClick={this.props.handleNavigateRequest.bind(this, this.props.windowPath + '/reports')} primaryText="Reports" />
                                    <MenuItem onClick={this.props.handleNavigateRequest.bind(this, this.props.windowPath + '/media')} primaryText="Media Browser" />
                                  </IconMenu>;
                          }
                        })()}



                      </ToolbarGroup>

                    </Toolbar>;*/
    }
}
