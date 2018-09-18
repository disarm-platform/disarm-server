# Create the image based on the official Node 8.9.0 image from Dockerhub
FROM node:8.9.0 as node

# Get all the code needed to run the app
COPY . /

# Install dependencies using npm
RUN npm install

## ENV variables
# MONGODB_URI=
# SHEETS_URI=
# SHEETS_PATH= TODO: Support this
# SECRET=
CMD npm run start
