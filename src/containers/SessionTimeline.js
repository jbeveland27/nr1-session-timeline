import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import { startCase } from 'lodash'
import SearchBar from './SearchBar'
import SearchResults from '../components/search-results/SearchResults'
import TimelineContainer from './TimelineContainer'
import config from '../config/config'

export default class SessionTimeline extends React.PureComponent {
  state = {
    filter: '',
    session: '',
  }

  onSelectFilter = filter => {
    this.setState({ filter })
  }

  onClearFilter = () => {
    this.setState({ filter: '' })
  }

  onChooseSession = session => {
    this.setState({ session })
  }

  render() {
    const { entity } = this.props
    const { filter, session } = this.state
    const { searchAttribute } = config

    return (
      <Grid className="container__grid-template">
        <GridItem className="timeline-grid-item" columnStart={1} columnEnd={12}>
          <SearchBar
            entity={entity}
            selectFilter={this.onSelectFilter}
            clearFilter={this.onClearFilter}
          />
        </GridItem>

        {filter && (
          <React.Fragment>
            <GridItem
              className="timeline-grid-item"
              columnStart={1}
              columnSpan={4}
              collapseGapAfter
            >
              <SearchResults
                entity={entity}
                selected={filter}
                chooseSession={this.onChooseSession}
              />
            </GridItem>
            <GridItem className="timeline-grid-item" columnSpan={8}>
              <TimelineContainer entity={entity} session={session} />
            </GridItem>
          </React.Fragment>
        )}

        {!filter && (
          <GridItem
            className="timeline-grid-item"
            columnStart={1}
            columnSpan={12}
          >
            <div className="empty-state">
              <HeadingText
                className="empty-state-header"
                type={HeadingText.TYPE.HEADING_3}
              >
                Search for a {startCase(searchAttribute)} to start
              </HeadingText>
              <div className="empty-state-desc">
                To get started, please search for and select an item in the
                search bar above
              </div>
            </div>
          </GridItem>
        )}
      </Grid>
    )
  }
}
