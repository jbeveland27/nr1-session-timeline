import React from 'react'
import PropTypes from 'prop-types'
import { NrqlQuery, HeadingText, Stack, StackItem, Spinner } from 'nr1'
import { sortBy, startCase } from 'lodash'
import EventStream from './EventStream'
import Timeline from './Timeline'
import eventGroup from './EventGroup'
import config from '../../config/config'

export default class TimelineContainer extends React.Component {
  state = {
    sessionData: [],
    loading: true,
    legend: [],
  }

  getData = async eventType => {
    const { accountId, session, duration } = this.props
    const { groupingAttribute } = config

    const query = `SELECT * from ${eventType} WHERE ${groupingAttribute} = '${session}' ORDER BY timestamp ASC LIMIT 1000 ${duration.since}`
    console.debug('timelineDetail.query', query)

    const { data } = await NrqlQuery.query({ accountId, query })

    let result = []
    if (data && data.chart.length > 0)
      result = data.chart[0].data.map(event => {
        const cleanedEvent = Object.keys(event).reduce((cleaned, key) => {
          if (!key.startsWith('nr.')) {
            cleaned[key] = event[key]
          }
          return cleaned
        }, {})

        cleanedEvent['eventType'] = eventType
        cleanedEvent['eventAction'] = this.getEventAction(
          cleanedEvent,
          eventType
        )
        return cleanedEvent
      })

    return result
  }

  getEventAction = (event, eventType) => {
    let action = ''
    if (eventType !== 'BrowserInteraction') action = eventType
    else
      action =
        event.category === 'Custom' ? 'Custom Interaction' : event.category

    return action
  }

  getLegend = data => {
    const legend = []
    for (let row of data) {
      const group = eventGroup(row.eventAction)
      const found = legend.filter(item => item.group.name === group.name)

      if (found.length === 0) {
        legend.push({ group, visible: true })
      }
    }

    return legend
  }

  onClickLegend = legendItem => {
    const legend = [...this.state.legend]

    let hiddenCount = 0

    legend.forEach(item => {
      if (item.group.name !== legendItem.group.name && !item.visible)
        hiddenCount++
    })

    if (legendItem.visible && hiddenCount === 0) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = false
      })
    } else if (legendItem.visible && hiddenCount === legend.length - 1) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = true
      })
    } else {
      for (let item of legend) {
        if (item.group.name === legendItem.group.name) {
          item.visible = !legendItem.visible
          break
        }
      }
    }

    this.setState({ legend })
  }

  async componentDidUpdate(prevProps) {
    const { session } = this.props
    const prevSession = prevProps.session

    if (session && session !== prevSession) {
      this.setState({ loading: true })
      const { timelineEventTypes } = config
      let data = []
      for (let eventType of timelineEventTypes) {
        data = data.concat(await this.getData(eventType))
      }

      data = sortBy(data, 'timestamp')

      const legend = this.getLegend(data)
      this.setState({ sessionData: data, loading: false, legend })
    }
  }

  render() {
    const { sessionData, loading, legend } = this.state
    const { session, filter } = this.props
    const { searchAttribute } = config

    return (
      <React.Fragment>
        {!session && (
          <div className="timeline-container">
            <div className="empty-state">
              <HeadingText
                className="empty-state-header"
                type={HeadingText.TYPE.HEADING_3}
              >
                Pick a session to continue
              </HeadingText>
              <div className="empty-state-desc">
                To view the timeline breakdown of a specific session, please
                click on a line item in the chart to the left.
              </div>
            </div>
          </div>
        )}
        {session && loading && (
          <div className="timeline-container">
            <Spinner />
          </div>
        )}
        {session && !loading && (
          <Stack
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
            fullHeight
            fullWidth
          >
            <StackItem className="timeline__stack-item stack__header">
              <div>
                <HeadingText type={HeadingText.TYPE.HEADING_3}>
                  Viewing Session {session}} for {startCase(searchAttribute)}{' '}
                  {filter}
                </HeadingText>
              </div>
            </StackItem>
            <StackItem grow className="timeline__stack-item">
              <Timeline
                data={sessionData}
                loading={loading}
                legend={legend}
                legendClick={this.onClickLegend}
              />
              <EventStream
                data={sessionData}
                loading={loading}
                legend={legend}
              />
            </StackItem>
          </Stack>
        )}
      </React.Fragment>
    )
  }
}

TimelineContainer.propTypes = {
  accountId: PropTypes.number.isRequired,
  session: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
  duration: PropTypes.object.isRequired,
}
