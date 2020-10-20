# 3. Using my Google Apps Script as an API 

*In the previous part we used a Google Apps Script to fetch data from our Google Fit app. Now let's turn our script into a web app, that outputs the data for our Arduino to read!*

<br /> 

## Step 1: Deploying the script as a web app
According to [Google's documentation](https://developers.google.com/apps-script/guides/web#:~:text=different%20parameter%20names.-,Deploying%20a%20script%20as%20a%20web%20app,the%20version%20you%20just%20saved), you can publish your script in multiple ways. In this case, I need the script to function as a sort of API, that outputs data in JSON. The best way to do that is to deploy the script as a web app. I made a little script to experiment with this a little at first.

First off, my script needed to contain a doGet() and doPost() function, for GET and POST requests that will be made to my web app. These functions can be as simple or as complicate as you want, so I kept them pretty simple for this experiment.

Because of security considerations, Google doesn't let your script return text directly to the browser. Hence, to make your script return text output, you use their ContentService class:

![image](https://user-images.githubusercontent.com/57796369/96646987-45c61e80-132d-11eb-8c6a-b25a3067dc34.png)

Nice! Now the script was ready to be published as a web app. I clicked **Publish > Implement as web app...** — executed the app as me (my gmail address) and set the access to "Everyone, even anonymous":

![image](https://user-images.githubusercontent.com/57796369/96647035-537ba400-132d-11eb-954a-851b83ea3622.png)

And it works! I went to the URL and got my doGet message back.

![image](https://user-images.githubusercontent.com/57796369/96647056-5bd3df00-132d-11eb-9c0a-694d73b8c440.png)

<br /> 

## Step 2: Returning JSON
You can also make your script return JSON, which is what I'll need to return my Google Fit data in a readable way. Doing so is fairly simple, and similar to the way I returned normal text.

First, I created a JSON object that I wanted the web app to return. This is a simple object that contains some information about a person:

![image](https://user-images.githubusercontent.com/57796369/96647091-67270a80-132d-11eb-98cf-5e52903f3d4a.png)

Then, I tweaked the doGet() function slightly: I replaced the previous text with the JSON object, and set the mime type to JSON. 

![image](https://user-images.githubusercontent.com/57796369/96647110-6d1ceb80-132d-11eb-991f-44d999b2a208.png)

❗ 'That should work,' I thought. However, when I visited the URL, the returned JSON object looked weird:

![image](https://user-images.githubusercontent.com/57796369/96647136-74dc9000-132d-11eb-955b-739fca69a25d.png)

I looked at the doGet() function, anod noticed that the output stringified the "testJSON" object. However, this was already a stringified JSON object, so that probably caused the weird formatting. So I fixed it:

![image](https://user-images.githubusercontent.com/57796369/96647154-7a39da80-132d-11eb-9988-52a58b832c7a.png)

And that's it! Now the URL returned the normal looking JSON object.

![image](https://user-images.githubusercontent.com/57796369/96647168-7f972500-132d-11eb-8607-a9e3db2a8d04.png)

<br /> 

## Step 3: Applying this to my Google Fit script
Finally, it was time do something similar with my real script. The doGet() function had to return my Metrics for a specific time-period as JSON. The doPost() function could stay fairly simple, as I didn't intend to make the desk send any data back. Turn this into code, and you get this:

![image](https://user-images.githubusercontent.com/57796369/96647257-9ccbf380-132d-11eb-91b8-0a571c99aa37.png)

After publishing the script the same way as before, my newly made web app now returned my Google Fit data (steps + distance) for the last day, in JSON! ✨

![image](https://user-images.githubusercontent.com/57796369/96647274-a35a6b00-132d-11eb-9781-9756a75a8d92.png)

*That's it for this part! In the next part we'll [fetch data from this API with our Arduino. 👉🏻](https://github.com/karimeij/smart-desk/blob/main/manual/part-3.md)*

<br /> 

## Sources
[https://developers.google.com/apps-script/guides/web](https://developers.google.com/apps-script/guides/web)
