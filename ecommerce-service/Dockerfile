# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /serverless-app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

RUN npm run build

ENV PORT=3002

# Expose the port (adjust based on your application's configuration)
EXPOSE ${PORT}

# Command to run the application
CMD [ "npx", "serverless", "offline", "--host", "0.0.0.0" ]
