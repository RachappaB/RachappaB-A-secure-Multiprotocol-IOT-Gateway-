#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;

const int interval = 2000; // Interval in milliseconds
unsigned long previousMillis = 0;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32test"); // Bluetooth device name
  Serial.println("The device started, now you can pair it with bluetooth!");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check if it's time to send a new random value
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Generate a random value (e.g., between 0 and 255)
    int randomValue = random(0, 256);
    
    // Send the random value over Bluetooth
    SerialBT.print("Random Value: ");
    SerialBT.println(randomValue);

    // Optionally, print the value to the serial monitor as well
    Serial.print("Sent Random Value: ");
    Serial.println(randomValue);
  }

  // Echo data received from Bluetooth to Serial
  if (SerialBT.available()) {
    Serial.write(SerialBT.read());
  }

  // Echo data received from Serial to Bluetooth
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }

  delay(20);
}
