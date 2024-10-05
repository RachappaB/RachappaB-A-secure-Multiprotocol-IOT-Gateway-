import serial
ser = serial.Serial('/dev/ttyUSB0', 9600)  # Adjust the port as needed
s = [0]

while True:
    r_s = ser.readline().decode().strip()  # Decode bytes to string and strip whitespace
    print(f"Raw received data: {r_s}")
    
    # Check if the string is a valid hex before converting
    if all(c in '0123456789ABCDEFabcdef' for c in r_s):
        s[0] = str(int(r_s, 16))
        print(f"Converted hex to int: {s[0]}")
    else:
        print(f"Received non-hex data: {r_s}")
