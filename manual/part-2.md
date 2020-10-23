# 2. Fetching Google Fit data with Google Apps Script

*In the previous part of the manual we created a project in the Google API Console, connected it to the Google Fit API and made OAuth2 credentials for it. In this part, we'll write a script that fetches Google Fit data using our OAuth2 credentials.*

<br /> 

## Step 1: Setting up the Google Apps Script project
The first thing we want to do is create our script/file. I went to [https://script.google.com/](https://script.google.com/) and clicked "+ New project". I got an empty file to start typing in and named it "Google Fit", as this script was going to be used mainly to fetch my Google Fit data and output it as JSON.

I started off the code with some constant variables. Remember the project I'd made in the Google API console earlier? When I made an OAuth token for it, it gave me a ClientID and ClientSecret that I need for OAuth authorization. So I went back to the API Console and went to the "Login credentials" page on the left side, then clicked the OAuth 2.0 client ID ("IotProject"):

![image](https://user-images.githubusercontent.com/57796369/96644540-82901680-1329-11eb-8388-92d900189e2d.png)

Then in my code code, I made two string variables containing the ClientID and ClientSecret. I'm blurring these out so that they can't be used by anyone else:

![image](https://user-images.githubusercontent.com/57796369/96644668-a9e6e380-1329-11eb-8561-94d5a3141ec6.png)

<br /> 

## Step 2: Authorizing our application for the user's Google Fit data
Now it was time to write my script's functions. First and foremost, I needed a function to let the user authorize my "application": the user needs to give the app permission to access their Google Fit data. They do this by visiting the authorization URL.

To handle all the authorization-related things for my script, I added the [apps-script-oauth2](https://github.com/googleworkspace/apps-script-oauth2) library to my script — this makes requesting OAuth2 access super easy.

Now that the library is imported, I started by creating an OAuth2 service: this service will be connected to my application and generate unique authorization URLs, tokens and other important thing's I'll need.

```jsx
function getFitService() {
	return OAuth2.createService('fit')
}
```

Then I set some important properties to this OAuth2 service, that tell it how to behave (explained in the code comments). I got these options from the [apps-script-oauth2 readme](https://github.com/googleworkspace/apps-script-oauth2#usage):

![image](https://user-images.githubusercontent.com/57796369/96644846-f16d6f80-1329-11eb-9f1d-7553635d780d.png)

As you may have noticed, I set the setCallbackFunction in the service to 'authCallback'. This is the function the service executes after the user authorizes the app, it will redirect the user to a confirmation page saying they can now close the authorization page. This callback function needs to be written by myself, so I did:

![image](https://user-images.githubusercontent.com/57796369/96644873-ffbb8b80-1329-11eb-8ce4-16751e4f5ac2.png)


<br /> 

## Step 3: Making the request body
The next function I wrote, is the one that makes the actual request. I started it off by defining the timeframe: I want to get the amount of steps from the last 30 minutes.

The Google Fit API expects the start and end time in milliseconds, so I started off by getting the time of now and 30 minutes ago in milliseconds.

![image](https://user-images.githubusercontent.com/57796369/96644999-35f90b00-132a-11eb-8655-e74a9dc7b91d.png)

Then I added the request body. When practicing on [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), I noticed they have a example request body for getting steps. Great! I tweaked this a little bit to get the metrics I wanted (I also want distance), and within the timeframe I want (with the start and end points I'd just defined):

![image](https://user-images.githubusercontent.com/57796369/96645014-3b565580-132a-11eb-9b8a-d9383a4caac9.png)

<br /> 

## Step 4: Making the request (first attempt)
'Cool,' I thought. Now that the OAuth2 service was created and linked to my app & the request body was made, I could start by making a request. 

I made the request using the UrlFetchApp class that Google provides. I used the previously made request body and OAuth access token

❗ Alright, so the request was set up. I thought I could now run the function to make the request, but sadly I got an error:

![image](https://user-images.githubusercontent.com/57796369/96645040-47daae00-132a-11eb-8b6f-50a93aca4d4a.png)
![image](https://user-images.githubusercontent.com/57796369/96645068-55903380-132a-11eb-8fdd-29cd055b2cf3.png)

<br /> 

## Step 5: Fixing the request body

The error clearly tells me that the start time had an invalid value. And then I noticed, my end time variable had `.getTime()` at the end, which converts the date into time in milliseconds — but the start time didn't. So I changed it:

![image](https://user-images.githubusercontent.com/57796369/96645120-6771d680-132a-11eb-8337-4d2dd558d287.png)

<br /> 

## Step 6: Making the request (second attempt)
So I fixed the request body and attempted to make a request again.

❗This time, I was greeted with another error:

![image](https://user-images.githubusercontent.com/57796369/96645143-735d9880-132a-11eb-85da-23869c67730f.png)
![image](https://user-images.githubusercontent.com/57796369/96645150-75bff280-132a-11eb-8c6a-5da258c30dc0.png)

<br /> 

## Step 7: Fixing the request body (again)
Since I'd just fixed the start time, I guessed there was something wrong with the end time now. I looked at it, and figured that maybe there'd be an issue with the fact that I tried to subtract milliseconds directly from a `new Date()`. Maybe I could just subtract the time from the `timeNow` variable:

![image](https://user-images.githubusercontent.com/57796369/96645181-807a8780-132a-11eb-9007-5f527fa58905.png)

🤬 Another error: 

![image](https://user-images.githubusercontent.com/57796369/96645205-8708ff00-132a-11eb-9a83-300d77572886.png)

*I seriously had no idea what could be wrong at this point. I walked away from the code for a bit because I was done, lol.*

When I came back, I finally realized: the API wants the start time to be the longest ago, and the end time to be the last time. I had switched them up! So I switched them around, fixing the last request body error:

![image](https://user-images.githubusercontent.com/57796369/96645231-8ff9d080-132a-11eb-81b6-9b51ba3a5695.png)

<br /> 

## Step 8: Making the request (third attempt)
Now that I'd finally fixed the request body, I ran the request function again.

❗ Unfortunately, instead I got an error message: "Error. Access not granted or expired."

![image](https://user-images.githubusercontent.com/57796369/96645333-b4ee4380-132a-11eb-9220-87b2828350d0.png)

How? I thought I'd done everything. I checked if maybe the ClientID and ClientSecret didn't match the actual ones from my project in the Google API Console, but they did.

After some searching, I realized: I had made the OAuth service in my script, but I had never actually used it to personally give my application permission to my Google Fit data. I needed to get the authorization URL to open the well-known "This app is asking your permission for..." window, and authorize the app.

<br /> 

## Step 9: Getting the authorization URL
I wrote a little function that checks if my application has access to my Google Fit data yet — if it does, nothing happens. If it doesn't, it will give me an authorization URL that I can visit to give the app access to my data.

![image](https://user-images.githubusercontent.com/57796369/96645352-be77ab80-132a-11eb-9d9a-d47ca001f14d.png)

I ran the function, opened the logbook and was greeted with the authorization URL:

![image](https://user-images.githubusercontent.com/57796369/96645375-c5062300-132a-11eb-82ab-a366e541e74e.png)

<br /> 

## Step 10: Authorizing my app
So I went to the authorization URL, but instead of an authorization screen, I got to see another error:

❗ Error 400: redirect_uri_mismatch

The error clearly explains that the redirect URL is not authorized by my app yet. So I went into my Google API Console project for my app: **Login credentials > OAuth 2.0-client-IDs > "IoTProject (type Web-app)" > Authorized redirect-URIs.**

I copied the redirect URI and added it to the authorized redirect URIs list.

![image](https://user-images.githubusercontent.com/57796369/96645489-ebc45980-132a-11eb-87f8-e41744966fb2.png)

After adding the URI, I went to the authorization page again. This time it worked! I gave my app permission to access my Google Fit data and I was redirected to the page that said: "Success! You can close this tab."

<br /> 

## Step 11: Making the request (successfully)
I ran the getMetrics function again, and this time I got no error messages! I checked to see if I got the right response, by printing the response in the logbook. It looked like this:

![image](https://user-images.githubusercontent.com/57796369/96645509-f4b52b00-132a-11eb-88ef-6d9b5654a7dc.png)

The response looks empty, but I assumed that this was because it was too big to display in the logbook. I made the same exact request in the OAuth playground and it gave the correct response, so I knew everything was alright! ✨

*And that's it for this part of the manual! We successfully fetched Google Fit data with a Google Apps Script, using OAuth2 authorization. In the next part we'll [turn this script into a web app, that outputs the fitness data as JSON. 👉🏻](https://github.com/karimeij/smartdesk/blob/main/manual/part-3.md)*

## Sources
* [https://developers.google.com/apps-script/api](https://developers.google.com/apps-script/api)
* [https://developers.google.com/datastudio/connector/auth#oauth2_3](https://developers.google.com/datastudio/connector/auth#oauth2_3)
* [https://www.c-sharpcorner.com/article/getting-started-with-google-fitness-rest-api-part-2/](https://www.c-sharpcorner.com/article/getting-started-with-google-fitness-rest-api-part-2/)
