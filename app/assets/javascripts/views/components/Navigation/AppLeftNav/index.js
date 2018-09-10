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
import React, { Component} from 'react';
import PropTypes from 'prop-types';
import Immutable, { Map } from 'immutable';

import provide from 'react-redux-provide';
import selectn from 'selectn';

// import {Divider, List, ListItem, LeftNav, AppBar} from 'material-ui';
import Divider from '@material-ui/core/Divider'
import { List, ListItem, ListItemText } from '@material-ui/core'
import Drawer from 'material-ui/Drawer'
import AppBar from 'material-ui/AppBar'

import IconButton from '@material-ui/core/IconButton';

import NavigationClose from '@material-ui/icons/Close';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import IntlService from 'views/services/intl';

@provide
export default class AppLeftNav extends Component {

  static propTypes = {
    toggleMenuAction: PropTypes.func.isRequired,
    computeToggleMenuAction: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    properties: PropTypes.object.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired,
    computeLoadNavigation: PropTypes.object.isRequired
  };

  intl = IntlService.instance;

  constructor(props, context) {
    super(props, context);

    this.state = this._getInitialState();

    // Bind methods to 'this'
    ['_onNavigateRequest', '_onRequestChange'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  /**
  * Initial state
  */
  _getInitialState() {

    const routes = Immutable.fromJS([
      {
          id: 'home',
          label: this.intl.translate({key: 'home', default: 'Home', case: 'first'}),
          path: "/"
      },
      {
          id: 'get-started',
          label: this.intl.translate({key: 'get_started', default: 'Get Started', case: 'first'}),
          path: "/content/get-started/"
      },
      {
          id: 'explore',
          label: this.intl.translate({key: 'general.explore', default: 'Explore Languages', case: 'first'}),
          path: '/explore/FV/sections/Data/',
      },
      {
          id: 'kids',
          label: this.intl.translate({key: 'kids', default: 'Kids', case: 'first'}),
          path: '/kids',
      },
      {
          id: 'contribute',
          label: this.intl.translate({key: 'contribute', default: 'Contribute', case: 'first'}),
          path: "/content/contribute/"
      }
    ]);

    return {
      routes: routes,
      nestedOpen: false
    };
  }

  componentWillReceiveProps(newProps) {
    /**
    * If the user is connected, display modified routes (splitting Explore path)
    */
    if (selectn("isConnected", this.props.computeLogin)) {

      let nestedItems = [
        <ListItem button onClick={this._onListItemClick('/explore/FV/Workspaces/Data/')} key="Workspaces">
          <ListItemText
            primary={this.intl.translate({
              key: 'views.components.navigation.workspace_dialects',
              default: 'Workspace Dialects'
            })}
            secondary={<p>{this.intl.translate({
              key: 'views.components.navigation.view_work_in_progress',
              default: 'View work in progress or unpublished content'
            })}.</p>}
            style={{ paddingLeft: '16px' }}
            primaryTypographyProps={{style: { fontSize: '16px' } }}
            secondaryTypographyProps={{ style: { fontSize: '14px' } }}
          />
        </ListItem>,

        <ListItem button onClick={this._onListItemClick('/explore/FV/sections/Data/')} key="sections">
          <ListItemText
            primary={this.intl.translate({
              key: 'views.components.navigation.published_dialects',
              default: 'Published Dialects'
            })}
            secondary={<p>{this.intl.translate({
              key: 'views.components.navigation.view_dialects_as_end_user',
              default: 'View dialects as an end user would view them'
            })}.</p>}
            style={{ paddingLeft: '16px' }}
            primaryTypographyProps={{style: { fontSize: '16px' } }}
            secondaryTypographyProps={{ style: { fontSize: '14px' } }}
          /> 
        </ListItem>
      ];

      let exploreEntry = this.state.routes.findEntry(function(value, key) {
        return value.get('id') === 'explore';
      });

      let newExploreEntry = exploreEntry[1].set('path', null).set('nestedItems', nestedItems);

      let newState = this.state.routes.set(exploreEntry[0], newExploreEntry);

      // Insert Tasks after explore
      let currentTasksEntry = newState.findEntry(function(value, key) {
        return value.get('id') === 'tasks';
      });

      if (currentTasksEntry == null) {
        newState = newState.insert(exploreEntry[0], new Map({
          id: 'tasks',
          label: this.intl.translate({key: 'tasks', default: 'Tasks', case: 'first'}),
          path: "/tasks/"
        }));
      }
      this.setState({routes: newState});

    } else {
      // If user logged out, revert to initial state
      this.setState(this._getInitialState());
    }
  }

  _onNavigateRequest(event, path) {
    if (path == '/logout/') {
      this.props.logout();
      this.props.pushWindowPath( '/' );
    } else {
      // Request to navigate to
      this.props.pushWindowPath(path);
    }

    // Close side-menu
    this.props.toggleMenuAction();
  }

  _onListItemClick(path) {
    return event => {
      this._onNavigateRequest(event, path)
    }
  }

  _onRequestChange() {
    // Close side-menu
    this.props.toggleMenuAction();
  }

  render() {

    return (
      <Drawer 
        docked={true}
        style={{height: 'auto'}}
        open={this.props.computeToggleMenuAction.menuVisible}
        onRequestChange={this._onRequestChange}
        >
          <AppBar
            iconElementLeft={<IconButton onClick={this._onRequestChange}><NavigationClose /></IconButton>}
            title={<img src="/assets/images/logo.png" style={{padding: '0 0 5px 0'}} alt={this.props.properties.title} />} />

          <List value={location.pathname} onChange={this._onNavigateRequest}>
 
            {this.state.routes.map((d, i) => 
              <React.Fragment>
                <ListItem
                  button
                  onClick={this._onListItemClick(d.get('path'))}
                  key={d.get('id')}>
                  <ListItemText primary={d.get('label')} primaryTypographyProps={{style: { fontSize: '16px' } }} />
                </ListItem>
                {d.get('nestedItems') && (
                  <List disablePadding>
                    {d.get('nestedItems')}
                  </List>
                )}
              </React.Fragment>
            )}

            {(selectn('response.entries', this.props.computeLoadNavigation) || []).map((d, i) => 
                <ListItem
                  button
                  onClick={this._onListItemClick('/content/' + selectn('properties.fvpage:url', d) + '/')}
                  key={selectn('uid', d)}>
                  <ListItemText primary={selectn('properties.dc:title', d)} primaryTypographyProps={{style: { fontSize: '16px' } }} />
                </ListItem>
            )}

          </List>

          <Divider />

          {(() => {

            if (selectn("isConnected", this.props.computeLogin)) {
              
              return <List value={location.pathname} onChange={this._onNavigateRequest}>

              <ListItem
                  button
                  onClick={this._onListItemClick('/profile/')}
                  key="profile">
                <ListItemText 
                  primary={this.intl.translate({
                      key: 'views.pages.users.profile.my_profile',
                      default: 'My Profile',
                      case: 'words'
                  })}
                  primaryTypographyProps={{style: { fontSize: '16px' } }} />
              </ListItem>

              <ListItem
                  button
                  onClick={this._onListItemClick('/logout/')}
                  key="sign-out">
                <ListItemText 
                  primary={this.intl.translate({
                      key: 'sign_out',
                      default: 'Sign Out',
                      case: 'words'
                  })}
                  primaryTypographyProps={{style: { fontSize: '16px' } }} />
              </ListItem>

              </List>;

            }

          })()}

      </Drawer>
    );
  }
}
