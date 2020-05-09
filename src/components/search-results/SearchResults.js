import React from 'react'
import PropTypes from 'prop-types'
import {
  NrqlQuery,
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  HeadingText,
} from 'nr1'
import config from '../../config/config'

export default class SearchResults extends React.PureComponent {
  flattenData = data => {
    let flattened = []

    for (let datum of data) {
      const name = datum.metadata.name
      flattened = flattened.concat(
        datum.data.map(item => {
          return { date: name, value: item.session }
        })
      )
    }

    return flattened
  }

  createTable = data => {
    console.debug('searchResults.createTable', data)
    return (
      <Table items={data}>
        <TableHeader>
          <TableHeaderCell className="search-results__table-header">
            Date
          </TableHeaderCell>
          <TableHeaderCell className="search-results__table-header">
            Session
          </TableHeaderCell>
        </TableHeader>

        {({ item }) => (
          <TableRow onClick={this.onChooseSession}>
            <TableRowCell className="search-results__row">
              {item.date}
            </TableRowCell>
            <TableRowCell className="search-results__row">
              {item.value}
            </TableRowCell>
          </TableRow>
        )}
      </Table>
    )
  }

  onChooseSession = (evt, { item, index }) => {
    const { chooseSession } = this.props
    chooseSession(item.date, item.value)
  }

  render() {
    const {
      entity: { accountId },
      selected,
      duration,
    } = this.props
    const { searchAttribute, event } = config
    const query = `FROM ${event} SELECT uniques(session) WHERE ${searchAttribute}='${selected}' ${duration.since} FACET dateOf(timestamp) `

    console.debug(`searchResults accountId: ${accountId} || query: ${query}`)

    return (
      <React.Fragment>
        {!selected && <div></div>}
        {selected && (
          <div className="search-results">
            <div>
              <HeadingText
                className="grid-item__header"
                type={HeadingText.TYPE.HEADING_4}
              >
                Select a Session
              </HeadingText>
            </div>
            <NrqlQuery accountId={accountId} query={query}>
              {({ data, error, loading }) => {
                if (loading) return <Spinner fillContainer />
                if (error) return <BlockText>{error.message}</BlockText>

                if (!data) return <div>No sessions found</div>
                return this.createTable(this.flattenData(data))
              }}
            </NrqlQuery>
          </div>
        )}
      </React.Fragment>
    )
  }
}

SearchResults.propTypes = {
  entity: PropTypes.object.isRequired,
  selected: PropTypes.string.isRequired,
  chooseSession: PropTypes.func.isRequired,
  duration: PropTypes.object.isRequired,
}
