import TorrentSearchApi from "torrent-search-api";
import fs from "fs";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Api from 'flood-api';

var app = express();
const httpServer = http.createServer(app)
const io = new Server(httpServer);


app.use(express.static("public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

TorrentSearchApi.enablePublicProviders();

const settings = JSON.parse(fs.readFileSync("./settings.json", { encoding: "utf8", flag: "r" }));
console.log(settings);
const api = new Api({
    baseUrl: settings.flood_uri + '/api',
    username: settings.flood_username,
    password: settings.flood_password,
});


api.client.connectionTest().then((resp) => console.log(resp));

io.on("connection", function (socket) {
    socket.emit('directories', settings.directories);
    socket.emit('flood_link', settings.flood_uri);

    socket.on("search", function (msg) {
        TorrentSearchApi.search(msg).then((torrents) => {
            socket.emit(
                "searchResult",
                torrents.filter((e) => !!e.magnet)
            );
        });
    });

    socket.on("add_to_flood", function (request) {
        console.log('flood_request', request);
        api.torrents.addUrls({
            urls: [
                request.magnet
            ],
            destination: request.destination,
            start: true,
          }).then((response) => {
            console.log('flood response',response);

            const success = Array.isArray(response) && response.length === 1 && response[0] === '0';
            socket.emit("add_to_flood_response", success);
          });
    });
});

httpServer.listen(settings.port, function () {
    console.log("listening on " +  settings.port);
});