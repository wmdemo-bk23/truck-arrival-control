# Multi-Client-Server Project for Truck Arrival Control

This repository contains a multi-client-server project built with Angular for clients and Node.js with Express for the server.

Link to admin demo page: https://wmdemobk-admin.netlify.app

## Project Structure

- **client**: Angular application for the admin panel.
- **admin**: Angular application for the client page.
- **server**: Node.js server built with Express.

## Getting Started

### Prerequisites

Make sure you have Node.js, npm and MongoDB installed on your machine.

### Installation

Run the following command in each directory to install the necessary dependencies:

```bash
npm install
```

### Setting Up MongoDB

Make sure MongoDB is installed and running on your machine. Update the server configuration in `server/.env` file with your MongoDB connection details.

## Running the Applications

### For admin folder

```bash
ng serve
```

### For client folder

```bash
ng serve --port=<any port>
```

### For server

```bash
npm run dev
```

## License

This project is licensed under the MIT License.
