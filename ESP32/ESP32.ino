#include <WiFi.h>
#include <HTTPClient.h>

// Replace with your network credentials
const char* ssid = "Rachappa";
const char* password = "shantappa9945483471";

// URL for the API endpoint
const char* serverUrl = "http://http://192.168.1.4:3001/project/insert/66d0d1db63b8e6c0a175f988";

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Connected to WiFi");

  // Create HTTPClient object
  HTTPClient http;
  
  // Specify request destination
  http.begin(serverUrl);
  
  // Specify content type
  http.addHeader("Content-Type", "application/json");

  // Prepare data to be sent
  String jsonData = "{\"column1\":\"5\"}"; // Adjust as needed
  
  // Send POST request
  int httpResponseCode = http.POST(jsonData);
  
  // Check for successful response
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response Code: " + String(httpResponseCode));
    Serial.println("Response Body: " + response);
  } else {
    Serial.println("Error on HTTP request");
  }

  // End HTTP request
  http.end();
}

void loop() {
  // Nothing to do here
}
