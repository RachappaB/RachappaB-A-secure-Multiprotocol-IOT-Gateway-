#include <SPI.h>
#include <LoRa.h>

char dataString[100] = {0};  // Buffer to hold hexadecimal data

void setup() {
  Serial.begin(9600);

  if (!LoRa.begin(433E6)) {  // Set frequency (same as sender)
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  Serial.println("LoRa Receiver");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Packet received
    Serial.println("Packet received!");

    // Read packet and convert to hex format
    int index = 0;
    while (LoRa.available() && index < sizeof(dataString) - 3) {  // Leave space for null terminator
      uint8_t byteData = LoRa.read();
      sprintf(&dataString[index], "%02X", byteData);  // Convert to hex and append to string
      index += 2;  // Move to the next hex representation
    }

    // Null terminate the string
    dataString[index] = '\0';

    // Print the received data in hexadecimal format
    Serial.print("Received Hex: ");
    Serial.println(dataString);
  }
}