
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
