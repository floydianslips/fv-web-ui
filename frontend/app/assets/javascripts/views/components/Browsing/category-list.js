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
import selectn from 'selectn';

import ConfGlobal from 'conf/local.json';

import Colors from 'material-ui/lib/styles/colors';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';

import UIHelpers from 'common/UIHelpers';
import IntlService from "views/services/intl";

const defaultStyle = {width: '100%', overflowY: 'auto', marginBottom: 24};

export default class CategoryList extends Component {

    static propTypes = {
        items: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.instanceOf(List)
        ]),
        filteredItems: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.instanceOf(List)
        ]),
        type: PropTypes.string,
        action: PropTypes.func,
        cols: PropTypes.number,
        cellHeight: PropTypes.number,
        style: PropTypes.object
    };

    static defaultProps = {
        cols: 3,
        cellHeight: 210,
        style: null
    }

    intl = IntlService.instance;

    constructor(props, context) {
        super(props, context);
    }

    render() {

        let items = this.props.filteredItems || this.props.items;

        if (!items || selectn('length', items) == 0) {
            return <div style={{margin: '20px 0'}}>{this.intl.translate({
                key: 'no_results_found',
                default: 'No Results Found',
                append: '.'
            })}</div>;
        }

        // If action is not defined
        let action;

        if (this.props.hasOwnProperty('action') && typeof this.props.action === "function") {
            action = this.props.action;
        } else {
            action = () => {
            };
        }

        return <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around'}}>
            <GridList
                cols={(UIHelpers.isViewSize('xs')) ? 2 : this.props.cols}
                cellHeight={this.props.cellHeight}
                style={Object.assign(defaultStyle, this.props.style)}
            >
                {(items).map(function (tile, i) {

                    return <GridTile
                        onTouchTap={action.bind(this, tile)}
                        key={tile.uid}
                        title={this.intl.searchAndReplace(tile.title)}
                        className="category-grid-tile"
                        titlePosition='bottom'
                    ><img
                        src={(selectn('properties.file:content.data', tile) || 'assets/images/cover.png')}/></GridTile>
                }.bind(this))}
            </GridList>
        </div>;
    }
}