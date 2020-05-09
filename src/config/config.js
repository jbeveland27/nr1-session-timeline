import { startCase } from 'lodash'
import { duration } from 'moment'

export default {
  searchAttribute: 'userId',
  event: 'BrowserInteraction',
  groupingAttribute: 'session',
  linkingAttribute: 'browserInteractionId',
  timelineEventTypes: [
    // 'PageView',
    'BrowserInteraction',
    'AjaxRequest',
    'JavaScriptError',
  ],
  eventTitleAttributes: [
    { name: 'PageView', primary: 'pageUrl', truncateStart: true },
    {
      name: 'BrowserInteraction',
      primary: 'actionText',
      secondary: 'browserInteractionName',
      truncateStart: true,
    },
    {
      name: 'AjaxRequest',
      primary: 'requestUrl',
      truncateStart: true,
    },
    {
      name: 'JavaScriptError',
      primary: 'errorMessage',
      secondary: 'errorClass',
      truncateStart: false,
    },
  ],
  eventThresholds: [
    {
      eventType: 'AjaxRequest',
      thresholds: [{ attribute: 'timeToLastCallbackEnd', threshold: 2 }],
    },
    {
      eventType: 'BrowserInteraction',
      thresholds: [
        {
          categoryAttribute: 'category',
          categoryValue: 'Initial page load',
          attribute: 'firstContentfulPaint',
          threshold: 2,
        },
        {
          categoryAttribute: 'category',
          categoryValue: 'Initial page load',
          attribute: 'timeToDomComplete',
          threshold: 10,
        },
        {
          categoryAttribute: 'category',
          categoryValue: 'Route change',
          attribute: 'duration',
          threshold: 8,
        },
      ],
    },
  ],
}
