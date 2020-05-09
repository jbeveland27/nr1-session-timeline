import React from 'react'
import PropTypes from 'prop-types'
import { NrqlQuery, HeadingText, Stack, StackItem, Spinner, Button } from 'nr1'
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
    warnings: false,
    warningCount: 0,
    showWarningsOnly: false,
  }

  getData = async eventType => {
    const {
      entity: { guid, accountId },
      filter,
      session,
      sessionDate,
      duration,
    } = this.props
    const { searchAttribute, groupingAttribute, linkingAttribute } = config

    let attributeClause = `${groupingAttribute} = '${session}' and ${searchAttribute} = '${filter}'`
    if (linkingAttribute) {
      const links = await this.getLinkingData(eventType)
      if (links && links.length > 0) {
        let linkedClause = `${linkingAttribute} IN (`
        links.forEach((link, index) => {
          linkedClause += `'${link}'`
          if (index + 1 < links.length) linkedClause += ','
        })
        linkedClause += ')'
        attributeClause = linkedClause
      }
    }

    const query = `SELECT * from ${eventType} WHERE entityGuid = '${guid}' and dateOf(timestamp) = '${sessionDate}' and ${attributeClause} ORDER BY timestamp ASC LIMIT MAX ${duration.since}`
    console.debug('timelineDetail.query', query)

    const { data } = await NrqlQuery.query({ accountId, query })

    let totalWarnings = 0
    let result = []
    if (data && data.chart.length > 0)
      result = data.chart[0].data.map(event => {
        event['eventType'] = eventType
        event['eventAction'] = this.getEventAction(event, eventType)

        const warnings = this.getWarningConditions(event, eventType)
        if (warnings && warnings.length > 0) {
          event['nr.warnings'] = true
          event['nr.warningConditions'] = warnings
          totalWarnings++
        }
        return event
      })

    return { result, totalWarnings }
  }

  getLinkingData = async eventType => {
    const {
      entity: { guid, accountId },
      filter,
      session,
      sessionDate,
      duration,
    } = this.props
    const { searchAttribute, groupingAttribute, linkingAttribute } = config

    const query = `SELECT uniques(${linkingAttribute}) from ${eventType} WHERE entityGuid = '${guid}' and dateOf(timestamp) = '${sessionDate}' and ${groupingAttribute} = '${session}' AND ${searchAttribute} = '${filter}' LIMIT MAX ${duration.since}`
    console.debug('timelineDetail.linkingQuery', query)

    const { data } = await NrqlQuery.query({ accountId, query })
    console.debug('timelineDetail.linkingQuery data', data)

    const result = []
    if (data && data.chart.length > 0)
      data.chart[0].data.forEach(event => result.push(event[linkingAttribute]))

    return result
  }

  getWarningConditions = (event, eventType) => {
    const { eventThresholds } = config
    const thresholds = eventThresholds.filter(
      threshold => threshold.eventType === eventType
    )

    let warnings = []
    if (thresholds && thresholds.length > 0) {
      for (let {
        categoryAttribute,
        categoryValue,
        attribute,
        threshold,
      } of thresholds[0].thresholds) {
        if (
          !categoryAttribute ||
          (categoryAttribute && event[categoryAttribute] === categoryValue)
        ) {
          if (event[attribute] > threshold) {
            const actual = event[attribute]
            warnings.push({ attribute, threshold, actual })
          }
        }
      }
    }
    return warnings
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

  onToggleWarnings = () => {
    const { showWarningsOnly } = this.state
    this.setState({ showWarningsOnly: !showWarningsOnly })
  }

  async componentDidUpdate(prevProps) {
    const { session, sessionDate } = this.props
    const prevSession = prevProps.session
    const prevSessionDate = prevProps.sessionDate

    if (
      session &&
      (session !== prevSession ||
        (session === prevSession && sessionDate != prevSessionDate))
    ) {
      this.setState({ loading: true })
      const { timelineEventTypes } = config
      let data = []
      let warnings = false
      let warningCount = 0
      for (let eventType of timelineEventTypes) {
        const { result, totalWarnings } = await this.getData(eventType)
        data = data.concat(result)
        if (totalWarnings > 0) {
          warnings = true
          warningCount += totalWarnings
        }
      }

      data = sortBy(data, 'timestamp')

      const legend = this.getLegend(data)
      this.setState({
        sessionData: data,
        loading: false,
        legend,
        warnings,
        warningCount,
        showWarningsOnly: false,
      })
    }
  }

  render() {
    const {
      sessionData,
      loading,
      legend,
      warnings,
      warningCount,
      showWarningsOnly,
    } = this.state
    const { session, sessionDate, filter } = this.props
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
                  Viewing Session {session} for {startCase(searchAttribute)}{' '}
                  {filter} ({sessionDate})
                </HeadingText>
              </div>
            </StackItem>
            <StackItem grow className="timeline__stack-item">
              <Timeline
                data={sessionData}
                loading={loading}
                legend={legend}
                legendClick={this.onClickLegend}
                showWarningsOnly={showWarningsOnly}
              />
              {warnings && (
                <div className="timline__warning">
                  <div className="timeline__warning-alert">
                    We found {warningCount} segments that violated expected
                    performance thresholds.
                  </div>
                  {/* <div
                    className="timeline__warning-button"
                    onClick={this.onToggleWarnings}
                  > */}
                  <Button
                    className="timeline__warning-button"
                    onClick={this.onToggleWarnings}
                    type={Button.TYPE.NORMAL}
                  >
                    {showWarningsOnly && 'Show all events'}
                    {!showWarningsOnly && 'Show violations only'}
                  </Button>
                  {/* </div> */}
                </div>
              )}
              <EventStream
                data={sessionData}
                loading={loading}
                legend={legend}
                showWarningsOnly={showWarningsOnly}
              />
            </StackItem>
          </Stack>
        )}
      </React.Fragment>
    )
  }
}

TimelineContainer.propTypes = {
  entity: PropTypes.object.isRequired,
  session: PropTypes.string.isRequired,
  sessionDate: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
  duration: PropTypes.object.isRequired,
}
