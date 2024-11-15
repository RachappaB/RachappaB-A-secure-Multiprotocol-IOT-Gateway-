from bluepy import btle
import time
import json
import paho.mqtt.client as mqtt

# UUIDs for the BLE service and characteristic (ensure they match ESP32 code)
SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0"
CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0"

# List of ESP32 MAC addresses
esp32_mac_addresses = [

    "EC:94:CB:4D:90:CE",
    "EC:94:CB:4B:DB:12"
]

# MQTT setup
MQTT_BROKER = 'localhost'  # Change if necessary
MQTT_PORT = 1883
MQTT_TOPIC = 'mac/{}/data'  # Use MAC address as project ID

# Create MQTT client
mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with result code {rc}")

# Connect to the MQTT broker
mqtt_client.on_connect = on_connect
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()  # Start a loop to handle MQTT events

# Custom delegate class to handle notifications
class MyDelegate(btle.DefaultDelegate):
    def __init__(self, mac_address):
        super().__init__()
        self.buffer = ""
        self.notification_count = 0
        self.mac_address = mac_address  # Store the MAC address for MQTT topic

    def handleNotification(self, cHandle, data):
        try:
            # Decode and process the received data
            decoded_data = data.decode('utf-8')
            print(f"Received raw data: {decoded_data}")

            # Add data to buffer for processing
            self.buffer += decoded_data

            # Try parsing the buffer
            json_data = json.loads(self.buffer.strip())
            print(f"Received JSON data: {json_data}")

            # Publish the data to MQTT
            mqtt_client.publish(MQTT_TOPIC.format(self.mac_address), json.dumps(json_data))
            print(f"Published data to MQTT topic {MQTT_TOPIC.format(self.mac_address)}")

            # Clear buffer after successful parsing
            self.buffer = ""
            self.notification_count += 1  # Count each notification received
        except (ValueError, json.JSONDecodeError):
            # If data isn't complete, continue accumulating it in the buffer
            pass

# Connect to a BLE device and subscribe to its notifications
def connect_to_device(mac_address, max_notifications=5, max_duration=30):
    try:
        print(f"Connecting to the BLE server at {mac_address}...")
        peripheral = btle.Peripheral(mac_address)
        delegate = MyDelegate(mac_address)
        peripheral.setDelegate(delegate)

        # Get the service and characteristic
        service = peripheral.getServiceByUUID(SERVICE_UUID)
        characteristic = service.getCharacteristics(CHARACTERISTIC_UUID)[0]

        # Subscribe to notifications by enabling the descriptor
        characteristic_desc = characteristic.getDescriptors(forUUID=0x2902)[0]
        characteristic_desc.write(b'\x01\x00', withResponse=True)

        print(f"Subscribed to notifications for {mac_address}. Listening for data...")

        # Track time and number of notifications
        start_time = time.time()
        while True:
            # Wait for notifications with a 1-second timeout to handle multiple devices faster
            if peripheral.waitForNotifications(1.0):
                # If notification count reaches the max limit, break out
                if delegate.notification_count >= max_notifications:
                    print(f"Received {max_notifications} notifications. Disconnecting from {mac_address}...")
                    break

            # Check if duration exceeds the max limit
            if time.time() - start_time > max_duration:
                print(f"Exceeded max duration of {max_duration} seconds. Disconnecting from {mac_address}...")
                break

        # Disconnect after handling notifications or exceeding limits
        peripheral.disconnect()
        print(f"Disconnected from {mac_address}.")

    except Exception as e:
        print(f"Failed to connect to the device {mac_address}: {e}")

# Main function to connect to each device in the list
def main():
    while True:
        for mac_address in esp32_mac_addresses:
            # Connect to each device, handling up to 5 notifications or a max duration of 30 seconds
            connect_to_device(mac_address, max_notifications=5, max_duration=30)

# Run the main function when the script is executed
if __name__ == "__main__":
    main()
