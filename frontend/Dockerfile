# Use Node.js 18 base image
FROM node:18.19.1

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Expose the default React port (usually 3000)
EXPOSE 3000

# Start the frontend server
CMD ["npm", "start"]
