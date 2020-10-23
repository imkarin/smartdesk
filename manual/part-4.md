# 4. Fetching our API's data with the Arduino & turning it into output

*In the previous part of the manual I turned my Google Apps Script into a web app, outputting my fitness data. In this final part, I'll fetch the data with the Arduino and turn it into LED output.*

<br />

## Step 1: Importing libraries & defining base variables
After importing the libraries via **Sketch > Include Library > Manage Libraries**, I included the libraries in my code:

![image](https://user-images.githubusercontent.com/57796369/96647587-3abfbe00-132e-11eb-85f7-4387bd3bb790.png)

Then I declared some base variables like my WiFi network, the URL of my Google Apps Script web app:

![image](https://user-images.githubusercontent.com/57796369/96647607-43b08f80-132e-11eb-9eca-42a4330d3d01.png)

<br />

## Step 2: Setup, connecting to WiFi
In the `setup()` function, I connected the Arduino to the WiFi useing the WiFiClientSecure library. This code is based on their example:

![image](https://user-images.githubusercontent.com/57796369/96647614-48754380-132e-11eb-84dc-ce10651454cd.png)

<br />

## Step 3: The loop & fetching Fit data
Now it was time to start writing the loop for the Arduino. The loop is fairly simple: *every 250 seconds, fetch the Fit data and handle it.*

I wrote the code for the Fit data HTTP request in a separate function, to keep everything more readable:

![image](https://user-images.githubusercontent.com/57796369/96647629-52974200-132e-11eb-9d43-0edc9f68bb84.png)

After the HTTP request, the fetched data gets passed to the extractDataFromAPI() function, where it gets extracted with ArduinoJson.

![image](https://user-images.githubusercontent.com/57796369/96647641-562ac900-132e-11eb-94ad-24638cfe81db.png)

❗ Unfortunately I got an error message saying that StaticJsonBuffer is a class from ArduinoJson 5.

![image](https://user-images.githubusercontent.com/57796369/96647652-5aef7d00-132e-11eb-8d6f-8b075b3963b1.png)

## Step 4: Updating my code to work with ArduinoJson 6.
The error message told me to go to [arduinojson.org/upgrade](http://arduinojson.org/upgrade), so I did. There was a very clear video on how to change my code to work with version 6, which I followed.

In short, ArduinoJsonBuffer was replaced with the newer ArduinoJsonDocument. It wasn't complicated, just some names and variables had to be changed. My new code looks like this:

![image](https://user-images.githubusercontent.com/57796369/96647666-62af2180-132e-11eb-8a79-6d5a3cbdead7.png)

<br />

## Step 5: Running the code
Upon running the code, I found that something was going wrong. The serial monitor kept saying `Loading (url)...` and I figured it probably couldn't fetch the data.

I added some code to the getFitData() function, to get the HttpCode and found out that it was 302:

![image](https://user-images.githubusercontent.com/57796369/96647734-85d9d100-132e-11eb-907f-72e4339495aa.png)

![image](https://user-images.githubusercontent.com/57796369/96647749-8bcfb200-132e-11eb-948d-222e5ef331f0.png)

❗ I Googled it and found out that this error means: *the resource requested has been temporarily moved to the URL given by the Location header.*

I looked at the URL of my Google Apps Script web app, and thought it looked fine. However, I noticed that every time I refreshed the page in my browser, the URL was different (the query parameters like *user_content_key* kept on changing).

To solve this issue, I found that the only solution is to somehow make my Arduino HTTP client follow the redirect. So I started looking into that.

<br />

## Step 6: Using HTTPSRedirect library
After a while, I found that people had also ran into the same issues, and someone had made a solution for it: the [HTTPSRedirect Library](https://github.com/electronicsguy/ESP8266/tree/master/HTTPSRedirect).

I downloaded the library's zip and added it through **Sketch > Include Library > Add .ZIP Library...**

![image](https://user-images.githubusercontent.com/57796369/96647807-a3a73600-132e-11eb-92b9-ce5e09ae8a0f.png)

Now it was time to adapt my code to the new library. Instead of using the `ESP8266Client` library, I'd now use the `HTTPSRedirect` library (and its `DebugMacros` file):

![image](https://user-images.githubusercontent.com/57796369/96647838-af92f800-132e-11eb-86d3-3d89900e90d6.png)

Then I changed some of the (variable) definitions:

![image](https://user-images.githubusercontent.com/57796369/96647854-b6216f80-132e-11eb-921c-ab995da3b95f.png)

Then in the `void setup()`, I removed the settings that had to do with the old HTTP client, and added the ones for the new HTTPSRedirect client:

![image](https://user-images.githubusercontent.com/57796369/96647868-bb7eba00-132e-11eb-9189-8b94a66da975.png)

Lastly, I completely changed the `getFitData()` function. I got this code from [the example](https://github.com/electronicsguy/ESP8266/blob/master/HTTPSRedirect/GoogleDocs.ino) of the HTTPSRedirect library. It does the same thing as my previous code, just with slightly different syntax:

![image](https://user-images.githubusercontent.com/57796369/96647887-c5a0b880-132e-11eb-9975-9e297e536e01.png)

Yay! Now that I ran the code again, the request worked — it got automatically redirected to the new URL that Google provided. It prints out the same JSON data as I got in the browser:

![image](https://user-images.githubusercontent.com/57796369/96647898-cdf8f380-132e-11eb-8f8b-b84bf882c7ca.png)

![image](https://user-images.githubusercontent.com/57796369/96647912-d18c7a80-132e-11eb-9ded-4d50c888db09.png)

<br />

## Step 7: Extracting the data with ArduinoJson
First of all, the handling of the data that the HTTP request returns was slightly different than before. To store the response data in a string object, I had to use `client->getResponseBody()`, then pass this string into the function that was going to handle the data properly. This is at the end of the `getFitData()` function:

![image](https://user-images.githubusercontent.com/57796369/96647939-dbae7900-132e-11eb-918b-d28867fb7d2d.png)

Now it was time to write the actual `handleData()` function, in which I would convert the data into LED output ("stand up" notification that the desk would give).

According to the [ArduinoJson library](https://arduinojson.org/) documentation, handling JSON data looks like this:

![image](https://user-images.githubusercontent.com/57796369/96647945-e0732d00-132e-11eb-9f32-08c3e4b95c81.png)

❗ However, upon running the code like this, I got the following error:

![image](https://user-images.githubusercontent.com/57796369/96647955-e49f4a80-132e-11eb-8beb-6795aad3ef57.png)

I soon figured out that it was easy to add more memory to the JSON document, by reading the [ArduinoJson documentation](https://arduinojson.org/v6/api/jsondocument/). So I increased it from 200kb to 600kb:

![image](https://user-images.githubusercontent.com/57796369/96647974-eb2dc200-132e-11eb-9a8a-02358c3e7762.png)

And it worked! The response was parsed and now I was able to select parts of the JSON document, which I needed for the next steps.

Lastly, I made a `steps` and `distance` variable and set them to the steps and distance from the JSON data. The final function looks like this:

![image](https://user-images.githubusercontent.com/57796369/96647991-f41e9380-132e-11eb-8f7a-087fa9683503.png)

![image](https://user-images.githubusercontent.com/57796369/96647993-f54fc080-132e-11eb-9c51-f813a594f934.png)

<br />

## Step 8: Turning the data into output
For the final step, I created a `convertToOutput()` function. This function takes the `steps` as a parameter and decides whether the user needs to get a "stand up!"-notification or not. In this case, that'll be the LEDs turning orange — or staying green.

The skeleton of the function looked like this:

![image](https://user-images.githubusercontent.com/57796369/96648040-0993bd80-132f-11eb-8dd6-0f78015a2552.png)

Before writing the rest of the function, I had to connect the LED strip to the Arduino Board.

<img width="50%" src="https://user-images.githubusercontent.com/57796369/96648052-11536200-132f-11eb-80fc-fa7c83d3ff11.png" />

- `5V` wire → `3V3` pin
- `GND` wire → `GND` pin
- `Din` wire → `D5` pin

I had already included the Adafruit Neopixel library, and defined the LED pin and count as global variables at the start of the file:

![image](https://user-images.githubusercontent.com/57796369/96648065-187a7000-132f-11eb-8c63-83a40af1d623.png)

❗ The only thing I'd forgotten to do, is to tell the Neopixel library my LED strip data. 

Also, I had to begin the pixels process in the `setup()`:

![image](https://user-images.githubusercontent.com/57796369/96648078-1fa17e00-132f-11eb-8d1c-7f24e8f10105.png)

![image](https://user-images.githubusercontent.com/57796369/96648080-20d2ab00-132f-11eb-9fb7-640f72b7fb80.png)

Lastly, I could now finish the `converToOutput()` function. Now, this function would turn the LEDs to green or orange, depending on whether the user has walked or not:

![image](https://user-images.githubusercontent.com/57796369/96648116-2e883080-132f-11eb-97e6-9e07bf5286a7.png)

And it works! The LEDs turned orange since I hadn't walked in the past hour. I also checked if it worked once I had walked.

<p float="left">
    <img width="45%" src="https://user-images.githubusercontent.com/57796369/96648190-49f33b80-132f-11eb-9c2b-65792c8bde4e.png" />
    <img width="45%" src="https://user-images.githubusercontent.com/57796369/96648211-5081b300-132f-11eb-9434-d4a1aec74e92.png" />
</p>

<p float="left">
    <img width="45%" src="https://user-images.githubusercontent.com/57796369/96648236-59728480-132f-11eb-9f58-456f788c5e07.png" />
    <img width="45%" src="https://user-images.githubusercontent.com/57796369/96648262-5f686580-132f-11eb-8eb1-e719c060e70d.png" />
</p>

And that's all for this manual! To summarize everything we did:

- We made a Google Cloud project that's connected to the Google Fitness API.
- We made a Google Apps Script that fetches the Fitness data.
- We turned our Google Apps Script into an API on its own, outputting the data in JSON.
- We fetched our API's data with our Arduino, and changed the LED color depending on the amount of steps we'd made in the past hour.

Thank you for reading! I definitely want to continue working on this Smart Desk project in the future. You can find the full code of this project on [GitHub](https://github.com/karimeij/smartdesk). ✨

<br />

## Sources
* [https://github.com/electronicsguy/ESP8266/tree/master/HTTPSRedirect](https://github.com/electronicsguy/ESP8266/tree/master/HTTPSRedirect)
* [https://arduinojson.org/v6/doc/upgrade/](https://arduinojson.org/v6/doc/upgrade/)
* [https://arduinojson.org/v6/api/jsondocument/](https://arduinojson.org/v6/api/jsondocument/)
