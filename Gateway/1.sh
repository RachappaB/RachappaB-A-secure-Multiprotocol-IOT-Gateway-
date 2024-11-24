#!/bin/bash

# Update and install necessary packages
sudo apt-get update
sudo apt install -y nodejs
sudo apt install -y npm
sudo apt install tmux
sudo apt install net-tools
# Verify the right Node.js and npm versions
node -v # should print `v18.20.5`
npm -v  # should print `10.8.2`

# Update and upgrade the system packages
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install mosquitto mosquitto-clients -y
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
sudo systemctl restart mosquitto


# Navigate to the backend directory, install dependencies and start the backend in a tmux session
cd RachappaB-A-secure-Multiprotocol-IOT-Gateway-/Gateway/backend/

# Install dependencies
# npm install 
# npm install sqlite3

# # Install build-essential if necessary
# sudo apt-get install -y build-essential

# # Remove any existing node_modules and package-lock.json, then reinstall the packages
# rm -rf node_modules package-lock.json
npm install

# Start the backend in a tmux session
tmux new-session -d -s backend_session "npm start"

# Navigate to the frontend directory, install dependencies and start the frontend in a separate tmux session
cd ../frontend/

# Install frontend dependencies
npm install

# Fix vulnerabilities and start the frontend in a tmux session
npm audit fix --force
tmux new-session -d -s frontend_session "npm start"

# Output message indicating the tmux sessions are running
echo "Backend and frontend are running in tmux sessions. Use 'tmux attach-session -t backend_session' and 'tmux attach-session -t frontend_session' to view logs."

# End of script
