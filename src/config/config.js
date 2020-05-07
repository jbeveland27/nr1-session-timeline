import { startCase } from 'lodash'

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
}
