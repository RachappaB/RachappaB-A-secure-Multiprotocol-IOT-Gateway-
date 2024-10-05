#include <WiFi.h>
#include <PubSubClient.h>

// Replace with your network credentials
const char* ssid = "Rachappa_Router_EXT";
const char* password = "RSB@123456";

// MQTT broker configuration
const char* mqttServer = "192.168.119.171"; // Replace with your MQTT broker IP address
const int mqttPort = 1883;                  // Default MQTT port
const char* mqttUser = "";                  // If your broker requires a username, enter it here
const char* mqttPassword = "";              // If your broker requires a password, enter it here

// MQTT topic to publish data
const char* topic = "project/66fcf56925e29e24d92592cc/data";

// WiFi and MQTT client instances
WiFiClient espClient;
PubSubClient client(espClient);

// Variable to store random values
float temperature = 0.0;
float humidity = 0.0;

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

  // Configure the MQTT client
  client.setServer(mqttServer, mqttPort);

  // Connect to MQTT broker
  connectToMQTT();
}

void connectToMQTT() {
  // Attempt to connect to the MQTT broker
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    // Connect with client ID and optional credentials
    if (client.connect("ESP32_Client", mqttUser, mqttPassword)) {
      Serial.println("connected");
    } else {
      Serial.print("Failed with state ");
      Serial.print(client.state());
      delay(2000); // Wait 2 seconds before retrying
    }
  }
}

void loop() {
  // Ensure MQTT connection is maintained
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();

  // Generate random values for temperature and humidity
  temperature = random(200, 300) / 10.0; // Temperature between 20.0 and 30.0
  humidity = random(300, 700) / 10.0;    // Humidity between 30.0 and 70.0

  // Create JSON formatted data string
  String jsonData = "{\"Temperature\":\"" + String(temperature) + "\", \"Humidity\":\"" + String(humidity) + "\"}";

  // Convert JSON string to char array for MQTT
  char msg[200];
  jsonData.toCharArray(msg, 200);

  // Publish the message to the specified topic
  client.publish(topic, msg);

  // Print out the data being sent
  Serial.println("Data published to MQTT:");
  Serial.println(jsonData);

  // Wait for 1 second before sending the next value
  delay(1000);
}
