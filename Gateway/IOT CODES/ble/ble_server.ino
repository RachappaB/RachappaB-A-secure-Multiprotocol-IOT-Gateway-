#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <esp_sleep.h>  // Include for deep sleep

// Define the service and characteristic UUIDs
#define SERVICE_UUID           "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID    "abcdef01-1234-5678-1234-56789abcdef0"

// Create a BLE Server and Characteristic
BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;

// Keep track of whether a device is connected or not
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Callback class for connection and disconnection events
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected, entering deep sleep...");
    }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("ESP32_Sensor_2");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());  // Set the connection callback

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic with READ, WRITE, and NOTIFY properties
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

  // Start the service
  pService->start();

  // Start advertising
  pServer->getAdvertising()->start();
  Serial.println("BLE Server started, advertising...");
}

void loop() {
  // Check connection status and send data if connected
  if (deviceConnected) {
    // Send data only when connected to a client
    static int value = 0;
    value++;

    // Update the characteristic value
    pCharacteristic->setValue(String(value).c_str());
    pCharacteristic->notify();  // Notify connected clients about the new value

    Serial.println("Updated value: " + String(value));
    delay(1000);  // Send data every second
  }

  // Handle device disconnection
  if (!deviceConnected && oldDeviceConnected) {
    // Device got disconnected, entering deep sleep mode
    Serial.println("Entering deep sleep for 10 seconds...");
    oldDeviceConnected = deviceConnected;  // Update old state

    // Prepare to wake up after 10 seconds
    esp_sleep_enable_timer_wakeup(10 * 1000000);  // 10 seconds in microseconds
    esp_deep_sleep_start();
  }

  // Handle new device connection
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;  // Update old state
  }
}
