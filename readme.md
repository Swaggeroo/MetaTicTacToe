# Meta Tic Tac Toe
[Rules](https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe)

## Getting Started
### Using Docker Compose
1. Install [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Copy `docker-compose.yaml` to your project directory
3. Use `docker-compose up` to start the server

### Using Docker
1. Install [Docker](https://docs.docker.com/install/)
2. Pull the image from Docker Hub: `docker pull ghcr.io/swaggeroo/meta-tic-tac-toe`
3. Run own mongo instance: `docker run -d --name mongo mongo`
4. Run the server: `docker run -d --name meta-tic-tac-toe -p 80:3000 --env mongoUrl=mongodb://mongo/metaTicTacToe ghcr.io/swaggeroo/meta-tic-tac-toe`

### Using Node.js
1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [MongoDB](https://docs.mongodb.com/manual/installation/)
3. Clone the repository: `git clone https://github.com/Swaggeroo/MetaTicTacToe.git`
4. Install dependencies: `npm install`
5. Start the server: `npm start`
6. Set environment variables:
    - `mongoUrl`: The URL of the MongoDB instance

## Configuration
### Environment Variables
- `mongoUrl`: The URL of the MongoDB instance

Optionally, you can set the following environment variables:

| Variable        | Default Value | Description                                                                        |
|-----------------|---------------|------------------------------------------------------------------------------------|
| `PORT`          | `3000`        | The port the server listens on (Also change port from docker deployment if in use) |
| `DEBUG`         |               | Set it to `app:*` to see debug output                                              |
| `mongoUser`     |               | Set username for mongodb                                                           |
| `mongoPassword` |               | Set password for mongodb                                                           |