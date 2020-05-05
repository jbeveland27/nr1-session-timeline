import React from 'react'
import PropTypes from 'prop-types'
import { Spinner } from 'nr1'

export default class SearchBarDrawer extends React.Component {
  myRef = React.createRef()

  onClickOutside = e => {
    const { closeOnClickOutside } = this.props
    if (!this.myRef.current.contains(e.target)) closeOnClickOutside()
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickOutside)
  }

  render() {
    const { loading, results, searchTerm, select } = this.props

    return (
      <div className="search-autocomplete__drawer" ref={this.myRef}>
        {loading && <Spinner type={Spinner.TYPE.DOT} />}
        {!loading && results.length == 0 && (
          <div className="search-autocomplete__empty">
            Sorry, we found no matches containing{' '}
            <span style={{ fontWeight: 'bold' }}>{searchTerm}</span>
          </div>
        )}
        {!loading &&
          results.map((result, idx) => (
            <div
              key={idx + result}
              className="search-autocomplete__item"
              onClick={() => select(result)}
            >
              {result}
            </div>
          ))}
      </div>
    )
  }
}

SearchBarDrawer.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  select: PropTypes.func.isRequired,
  closeOnClickOutside: PropTypes.func.isRequired,
}