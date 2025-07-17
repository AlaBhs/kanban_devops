# Step 1: Use an official Node.js base image
FROM node:20

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package files and install deps
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of the app source
COPY . .

# Step 5: Expose the port the app runs on
EXPOSE 5000

# Step 6: Set the default command
CMD ["npm", "run", "dev"]
