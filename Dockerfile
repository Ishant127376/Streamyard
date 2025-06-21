# FROM ubuntu:focal

# RUN /usr/bin/apt-get update && \
#     /usr/bin/apt-get install -y curl && \
#     curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
#     /usr/bin/apt-get update && \
#     /usr/bin/apt-get upgrade -y && \
#     /usr/bin/apt-get install -y nodejs ffmpeg

# WORKDIR /home/app

# RUN npm i -g nodemon

# CMD nodemon index.js

# Use a base image with Node
FROM node:18

# Install ffmpeg (this is the fix)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy only dependencies first
COPY package.json yarn.lock ./
RUN yarn install

# Copy rest of the code
COPY . .

# Create video directory inside image
RUN mkdir -p /app/videos

# Expose port
EXPOSE 3000

# Start command
CMD ["yarn", "dev"]
