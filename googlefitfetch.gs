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

function getFitService() {
  return OAuth2.createService('fit')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId(ClientID)
      .setClientSecret(ClientSecret)
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read')

      // Below are Google-specific OAuth2 parameters.
      .setParam('login_hint', Session.getActiveUser().getEmail())
      .setParam('access_type', 'offline')
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
