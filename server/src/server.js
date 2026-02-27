import express from "express";
import http from "http";
import { Server } from "socket.io";

import socketHandler from "./socket/session.socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

socketHandler(io);

app.use("/", (_, res) => {
  return res.send("server is running");
});

server.listen(5000, () => {
  console.log("Server running");
});
