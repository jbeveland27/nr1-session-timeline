export default {
  searchAttribute: 'userId', // the attribute to locate related events (will search for groupingAttribute) - mandatory
  event: 'BrowserInteraction', // the root event to search against and build the event stream from - mandatory
  groupingAttribute: 'session', // the attribute to group events - mandatory
  linkingAttribute: '', // the attribute to use to identify related events - optional, will use groupingAttribute if not present
  timelineEventTypes: [
    // the events to include in the resulting event stream - must include at least one eventType
    // 'PageView',
    'BrowserInteraction',
    'AjaxRequest',
    'JavaScriptError',
  ],
  eventTitleAttributes: [
    // attributes to include as additional info in the event stream segment headers; optional
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
    // event stream results will be evaluated against this set of thresholds
    {
      eventType: 'AjaxRequest',
      thresholds: [
        { attribute: 'timeToSettle', threshold: 10 },
        { attribute: 'timeSinceBrowserInteractionStart', threshold: 15 },
      ],
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
          threshold: 5,
        },
      ],
    },
  ],
}
