// add your Google API Project OAuth client ID and client secret here
const ClientID = 'CLIENTID_HERE';
const ClientSecret = 'CLIENTSECRET_HERE';

function doGet() {
  json = getMetricsForHours(1);
  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON); 
}

function doPost() {
  Logger.log("Post request");
}

// see step count example at https://developers.google.com/fit/scenarios/read-daily-step-total
// adapted below to handle multiple metrics (steps, weight, distance), only logged if present for day
function getMetricsForHours(untilHoursAgo) {
  Logger.log("Getting metrics...")
  
  const timeFrame = 1000 * 60 * 60 * untilHoursAgo
  const timeNow = new Date().getTime();
  const timeXHoursAgo = timeNow - (timeFrame);
  

  const start = timeXHoursAgo;
  const end = timeNow;
  
  var fitService = getFitService();
  
  var request = {
    "aggregateBy": [
      {
        "dataTypeName": "com.google.step_count.delta",
        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      },
      {
        "dataTypeName": "com.google.weight.summary",
        "dataSourceId": "derived:com.google.weight:com.google.android.gms:merge_weight"
      },
      {
        "dataTypeName": "com.google.distance.delta",
        "dataSourceId": "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta"
      }
    ],
    "bucketByTime": { "durationMillis": timeFrame },
    "startTimeMillis": start,
    "endTimeMillis": end
  };
  
  var response = UrlFetchApp.fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    headers: {
      Authorization: 'Bearer ' + fitService.getAccessToken()
    },
    'method' : 'post',
    'contentType' : 'application/json',
    'payload' : JSON.stringify(request, null, 2)
  });
  
  var json = JSON.parse(response.getContentText());
  Logger.log(response)
  return json
}

// functions below adapted from Google OAuth example at https://github.com/googlesamples/apps-script-oauth2

function getFitService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('fit')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(ClientID)
      .setClientSecret(ClientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      // see https://developers.google.com/fit/rest/v1/authorization for a list of Google Fit scopes
      .setScope('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      // .setParam('approval_prompt', 'force');
}

function getAuthLink() {
  var fitService = getFitService();
  if (!fitService.hasAccess()) {
    var authorizationUrl = fitService.getAuthorizationUrl();
    Logger.log(authorizationUrl)
  } else {
    return;
  }
}

function authCallback(request) {
  var fitService = getFitService();
  var isAuthorized = fitService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function clearProps() {
  PropertiesService.getUserProperties().deleteAllProperties();
}
