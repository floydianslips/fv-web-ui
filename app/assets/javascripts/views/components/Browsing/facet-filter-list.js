import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Immutable, {List, Set, Map} from 'immutable';

import selectn from 'selectn';

import Paper from '@material-ui/core/Paper';
import ListUI from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ActionGrade from '@material-ui/icons/Grade';
import Checkbox from '@material-ui/core/Checkbox';
import withToggle from 'views/hoc/view/with-toggle';
import IntlService from "views/services/intl";

const FiltersWithToggle = withToggle();

export default class FacetFilterList extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        facets: PropTypes.array.isRequired,
        onFacetSelected: PropTypes.func.isRequired,
        facetField: PropTypes.string.isRequired,
        appliedFilterIds: PropTypes.instanceOf(Set)
    };

    intl = IntlService.instance;

    constructor(props, context) {
        super(props, context);

        this.state = {
            checked: props.appliedFilterIds
        };

        ['_toggleCheckbox'].forEach((method => this[method] = this[method].bind(this)));
    }

    _toggleCheckbox(facetId, childrenIDs = [], event, checked) {
        this.props.onFacetSelected(this.props.facetField, facetId, childrenIDs, event, checked);

        let newList;

        // Checking
        if (checked) {
            newList = this.state.checked.add(facetId);

            // Add all children
            if (childrenIDs) {
                childrenIDs.forEach((childId, i) => {
                    newList = newList.add(childId)
                });
            }
        }
        // Unchecking
        else {
            newList = this.state.checked.delete(this.state.checked.keyOf(facetId));

            // Remove children
            if (childrenIDs) {
                childrenIDs.forEach((childId, i) => {
                    newList = newList.delete(newList.keyOf(childId))
                });
            }
        }

        this.setState({checked: newList});
    }

    render() {

        const listItemStyle = {fontSize: '13px', fontWeight: 'normal'};

        return <FiltersWithToggle label={this.intl.searchAndReplace(this.props.title)} mobileOnly={true}>
            <Paper style={{maxHeight: '70vh', overflow: 'auto'}}>
                <ListUI subheader={this.intl.searchAndReplace(this.props.title)}>

                    {(this.props.facets || []).map(function (facet, i) {

                        let childrenIds = [];
                        let parentFacetChecked = this.state.checked.includes(facet.uid)

                        let nestedItems = [];
                        let children = selectn('contextParameters.children.entries', facet).sort(function (a, b) {
                            if (a.title < b.title) return -1;
                            if (a.title > b.title) return 1;
                            return 0;
                        });

                        // Render children if exist 
                        if (children.length > 0) {
                            children.map(function (facetChild, i) {

                                childrenIds.push(facetChild.uid);

                                // Mark as checked if parent checked or if it is checked directly.
                                let checked = this.state.checked.includes(facetChild.uid);

                                nestedItems.push(<ListItem
                                    key={facetChild.uid}
                                    leftCheckbox={<Checkbox checked={checked}
                                                            onChange={this._toggleCheckbox.bind(this, facetChild.uid, null)}/>}
                                    style={listItemStyle}
                                    primaryText={this.intl.searchAndReplace(facetChild.title)}/>);
                            }.bind(this));
                        }

                        return <ListItem
                            style={listItemStyle}
                            key={facet.uid}
                            leftCheckbox={<Checkbox checked={parentFacetChecked}
                            onChange={this._toggleCheckbox.bind(this, facet.uid, childrenIds)}/>}
                            primaryText={facet.title}
                            open={parentFacetChecked}
                            initiallyOpen={true}
                            autoGenerateNestedIndicator={false}
                            nestedItems={nestedItems}>
                                <ListItemText
                                    primary={facet.title}
                                />
                            </ListItem>
                    }.bind(this))}

                </ListUI>
            </Paper>
        </FiltersWithToggle>;
    }
}