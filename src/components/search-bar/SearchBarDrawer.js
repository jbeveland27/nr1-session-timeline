import React from 'react'
import PropTypes from 'prop-types'
import { Spinner } from 'nr1'

const searchBarDrawer = props => {
  const { loading, results, searchTerm, select } = props
  console.debug('searchBarDrawer props', props)
  return (
    <div className="search-autocomplete__drawer">
      {loading && <Spinner type={Spinner.TYPE.DOT} />}
      {!loading && results.length == 0 && (
        <div className="search-autocomplete__empty">
          Sorry, we found no matches containing <span style={{fontWeight: "bold"}}>{searchTerm}</span>
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

searchBarDrawer.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  select: PropTypes.func.isRequired,
}

export default searchBarDrawer
