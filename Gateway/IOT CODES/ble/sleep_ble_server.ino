#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Define the service and characteristic UUIDs
#define SERVICE_UUID           "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID    "abcdef01-1234-5678-1234-56789abcdef0"

// Create a BLE Server and a BLE Characteristic
BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;

bool deviceConnected = false;  // Track if a device is connected

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device connected.");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device disconnected. Going to sleep for 10 seconds...");
    delay(1000); // Allow some time to gracefully disconnect

    // Enter sleep mode for 10 seconds
    esp_sleep_enable_timer_wakeup(10 * 1000000);  // 10 seconds
    esp_deep_sleep_start();
  }
};

void setup() {
  Serial.begin(115200);

  // Initialize BLE
  BLEDevice::init("ESP32_Sensor_2");

  // Print the MAC address of the ESP32
  String macAddress = BLEDevice::getAddress().toString();
  Serial.print("BLE MAC Address: ");
  Serial.println(macAddress);

  // Create the BLE Server and set callback for connection/disconnection
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create the BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  // Set initial value for the characteristic
  pCharacteristic->setValue("Initial Value");

  // Add a descriptor to the characteristic to enable notifications
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service and begin advertising
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("BLE Server started, advertising...");
}

void loop() {
  if (deviceConnected) {
      // Prepare data to be sent
    int randomValue = random(1, 101);  // Generate a random value between 1 and 100
    String jsonData = "{\"Random_value\":\"" + String(randomValue) + "\"}";

    // Uncomment below for two values
    // String jsonData = "{\"Temperature\":\"25.5\", \"Humidity\":\"60\"}";

    // Uncomment below for three values
    // String jsonData = "{\"Temperature\":\"25.5\", \"Humidity\":\"60\", \"Pressure\":\"1013\"}";

    // Update the characteristic value and notify the connected device
    pCharacteristic->setValue(jsonData.c_str());  // Set the value as a string
    pCharacteristic->notify();  // Notify the connected device about the new value

    // Debug print
    Serial.println("Updated value: " + jsonData);

    delay(1000);  // Update the value every second  } else {
    // No device is connected, idle or perform low-power operations
    Serial.println("No device connected. Waiting for a connection...");
    delay(2000);  // Check every 2 seconds
  }
}
