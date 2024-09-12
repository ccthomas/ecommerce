# Use the official Node.js image as the base image
FROM node:20-alpine

# Define build arguments
ARG REACT_APP_PORT
ARG REACT_APP_SERVICE_API

# Set environment variable (optional, can be used within Dockerfile)
ENV REACT_APP_PORT=${REACT_APP_PORT}

ENV REACT_APP_SERVICE_API=${REACT_APP_SERVICE_API}

# Print environment variables (for debugging)
RUN echo "REACT_APP_PORT: ${REACT_APP_PORT}"

RUN echo "REACT_APP_SERVICE_API: ${REACT_APP_SERVICE_API}"

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN npm run build

# Install 'serve' to serve the build directory
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE ${REACT_APP_PORT}

# Define the command to run the app using 'serve' with dynamic port
CMD ["sh", "-c", "serve -s build -l $REACT_APP_PORT"]
