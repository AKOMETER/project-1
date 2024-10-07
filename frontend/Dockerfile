# Use the official Node.js image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies with extended timeout
RUN npm install

# Copy the rest of the frontend source code to the container
COPY . .

# Build the React app
RUN npm run build

# Expose the port
EXPOSE 3000

# Serve the React app using a simple server
CMD ["npm", "run", "start"]
