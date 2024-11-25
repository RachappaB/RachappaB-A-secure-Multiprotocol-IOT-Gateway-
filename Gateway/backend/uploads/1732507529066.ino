#include <WiFi.h>
#include <HTTPClient.h>

// Replace with your network credentials
const char* ssid = "Rachappa_Router_EXT";
const char* password = "RSB@123456";

// URL for the API endpoint
const char* serverUrl = "http://192.168.119.171:3001/project/insert/66fcf56925e29e24d92592cc";

// Variable to store random value
int randomValue = 0;

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
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) { // Check if Wi-Fi is still connected
    // Create HTTPClient object
    HTTPClient http;
    
    // Specify request destination
    http.begin(serverUrl);
    
    // Specify content type
    http.addHeader("Content-Type", "application/json");

    // Generate a new random value to send
    randomValue = random(1, 101); // Random value between 1 and 100

    // Prepare data to be sent
    String jsonData = "{\"Random_value\":\"" + String(randomValue) + "\"}";

    // // Prepare data to be sent (two values)
    // String jsonDataTwoValues = "{\"Temperature\":\"25.5\", \"Humidity\":\"60\"}"; 

    // // Prepare data to be sent (three values)
    // String jsonDataThreeValues = "{\"Temperature\":\"25.5\", \"Humidity\":\"60\", \"Pressure\":\"1013\"}"; 



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
  } else {
    Serial.println("WiFi Disconnected");
  }

  // Wait for 1 second before sending the next value
  delay(1000);
}
