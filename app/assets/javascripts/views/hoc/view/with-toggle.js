import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Immutable, {List, Map} from 'immutable';
import classNames from 'classnames';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

export default function withToggle() {
    class ViewwithToggle extends Component {

        static defaultProps = {
            mobileOnly: false,
            label: 'Toggle Panel'
        }

        static propTypes = {
            mobileOnly: PropTypes.bool,
            label: PropTypes.string
        }

        constructor(props, context) {
            super(props, context);

            this.state = {
                open: false
            };
        }

        render() {

            let {mobileOnly, label} = this.props;
            const fontStyle = {float: 'right', lineHeight: 1}
            const icon = this.state.open ? 
                <ExpandLessIcon className="material-icons" style={style}/> : 
                <ExpandMoreIcon className="material-icons" style={style}/>;

            return <div className={classNames('panel', 'panel-default')}>
                <div className="panel-heading">
                    {label} <Button variant='flat' className={classNames({'visible-xs': mobileOnly})}
                                        label={(this.state.open) ? intl.trans('hide', 'Hide', 'first') : intl.trans('show', 'Show', 'first')}
                                        labelPosition="before" onClick={(e) => {
                    this.setState({open: !this.state.open});
                    e.preventDefault();
                }} icon={icon}
                                        style={{float: 'right', lineHeight: 1}}/>
                </div>

                <div className={classNames('panel-body', {'hidden-xs': !this.state.open && mobileOnly})}>
                    {this.props.children}
                </div>
            </div>;
        }
    }

    return ViewwithToggle;
}