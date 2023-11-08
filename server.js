const http = require("node:http");
const app = require("./app");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => console.log(`Server started at port: ${port}`));
