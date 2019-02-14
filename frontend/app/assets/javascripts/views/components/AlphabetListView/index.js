import React, { Component } from 'react'
// import Immutable, { Set, Map } from 'immutable'
import { PropTypes } from 'react'
import provide from 'react-redux-provide'
// import StringHelpers from 'common/StringHelpers'
import selectn from 'selectn'
// import classNames from 'classnames'
import IntlService from 'views/services/intl'
import ProviderHelpers from 'common/ProviderHelpers'

const { any, func, string, bool, object, number } = PropTypes
const intl = IntlService.instance

@provide
class AlphabetListView extends Component {
  static propTypes = {
    // computeDirectory: object.isRequired,
    // fetchDirectory: func.isRequired,
    handleClick: func,
    routeParams: object.isRequired,
    dialect: any.isRequired,
    computeCharacters: PropTypes.object.isRequired, // via provide
    fetchDialect2: PropTypes.func.isRequired,
    fetchCharacters: PropTypes.func.isRequired,
    letter: PropTypes.string,
  }
  static defaultProps = {
    handleClick: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      renderCycle: 0,
    }
    ;['_generateTiles'].forEach((method) => (this[method] = this[method].bind(this)))
  }

  // componentDidMount() {
  // }

  async componentDidUpdate(prevProps) {
    if (prevProps.dialect === undefined && this.props.dialect) {
      const { routeParams } = this.props
      await ProviderHelpers.fetchIfMissing(routeParams.dialect_path, this.props.fetchDialect2)
      const _pageIndex = 0
      const _pageSize = 100
      await this.props.fetchCharacters(
        `${routeParams.dialect_path}/Alphabet`,
        `&currentPageIndex=${_pageIndex}&pageSize=${_pageSize}&sortOrder=asc&sortBy=fvcharacter:alphabet_order`
      )

      const computedCharacters = await ProviderHelpers.getEntry(
        this.props.computeCharacters,
        `${routeParams.dialect_path}/Alphabet`
      )

      const entries = selectn('response.entries', computedCharacters)
      this.setState({
        renderCycle: this.state.renderCycle + 1,
        entries,
      })
    }
    if (prevProps.letter === undefined && this.props.letter) {
      this.setState({
        renderCycle: this.state.renderCycle + 1,
      })
    }
  }

  render() {
    const { renderCycle } = this.state
    const content = renderCycle !== 0 ? this._generateTiles() : null
    return <div className="AlphabetListView">{content}</div>
  }
  _generateTiles() {
    const { entries } = this.state
    const { letter } = this.props
    const _entries = entries.map((value, index) => {
      const _letter = value.title
      return (
        <div
          className={`AlphabetListViewTile ${letter === _letter ? 'AlphabetListViewTile--active' : ''}`}
          onClick={() => {
            this.props.handleClick(_letter)
          }}
          key={index}
        >
          {_letter}
        </div>
      )
    })
    let content = null
    if (_entries.length > 0) {
      content = (
        <div>
          <h2>
            {intl.trans('views.pages.explore.dialect.learn.words.find_by_alphabet', 'Browse Alphabetically', 'words')}
          </h2>
          <div className="AlphabetListViewTiles">{_entries}</div>
        </div>
      )
    }
    return content
  }
}

export { AlphabetListView }
