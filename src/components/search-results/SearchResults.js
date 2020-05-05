import React from 'react'
import PropTypes from 'prop-types'

const searchResults = props => {
  const { selected } = props

  return <div>SearchResults</div>
}

searchResults.propTypes = {
  selected: PropTypes.string.isRequired,
}

export default searchResults
