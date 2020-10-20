// Include libraries
#include <Adafruit_NeoPixel.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <DebugMacros.h>
#include <HTTPSRedirect.h>

// LED strip vars
#define LED_PIN D5
#define LED_COUNT 30
Adafruit_NeoPixel pixels(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// network vars
const char* ssid = "WIFISSID";         
const char* password = "WIFIPASS";    

// google apps script vars
const char* host = "script.google.com";
const char *GScriptID = "GSCRIPTID";
int steps;
float distance;
String url = String("/macros/s/") + GScriptID + "/exec";

// https
HTTPSRedirect* client = nullptr;
const int httpsPort = 443;

void setup() {
  // Start serial monitor
  Serial.begin(115200);
  delay(10);

  // Turn on LED strip
  pixels.begin();

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to "); Serial.println(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("."); // prints dots while logging into WiFi network
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // Settings for the HTTPSRedirect client
  client = new HTTPSRedirect(httpsPort);
  client->setInsecure();
  client->setPrintResponseBody(true);
  client->setContentTypeHeader("application/json");
}

void loop() {
  getFitData();  // get the google fit data
  delay(5000); // connects to the fit api every 5 seconds (the api contains data from the last 60 min)
}

// Function that gets the google fit data from my google apps script
void getFitData() {
  Serial.print("Connecting to " + String(host));

  // Try to connect 5 times, then exit
  bool flag = false;
  for (int i = 0; i < 5; i++) {
    int retval = client->connect(host, httpsPort);
    if (retval == 1) {
      flag = true;
      break;
    }
    else
      Serial.println("Connection failed. Retrying...");
  }

  if (!flag) {
    Serial.print("Could not connect to server: ");
    Serial.println(host);
    Serial.println("Exiting...");
    return;
  }

  Serial.println("");
  client->GET(url, host);
  
  String response = client->getResponseBody();
  handleData(response);
}

StaticJsonDocument<1200> doc;

// Handle fetched data
void handleData(String data) {
  DeserializationError error = deserializeJson(doc, data);

  // test if parsing succeeds
  if (error) {
    Serial.println("deserializeJson() failed with code ");
    Serial.println(error.c_str());
    return;
  }

  // handle data
  steps = doc["bucket"][0]["dataset"][0]["point"][0]["value"][0]["intVal"];
  distance = doc["bucket"][0]["dataset"][2]["point"][0]["value"][0]["fpVal"];
  Serial.println("Steps: " + String(steps));
  Serial.println("Distance: " + String(distance));

  convertToOutput(steps);
}

// Convert data to output
void convertToOutput(int steps) {
  for(int i=0; i<LED_COUNT; i++) {
    if (steps > 0) {     // if the user has walked in the last hour, keep the LEDs green
      pixels.setPixelColor(i, pixels.Color(9, 176, 12));
    }
    else {     // if the user hasn't walked, make LEDs orange
      pixels.setPixelColor(i, pixels.Color(255, 130, 41));
    }
    
    pixels.show();
    }
}
