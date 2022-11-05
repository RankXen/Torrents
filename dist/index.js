"use strict";

var _torrentSearchApi = require("torrent-search-api");

var _torrentSearchApi2 = _interopRequireDefault(_torrentSearchApi);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _floodApi = require("flood-api");

var _floodApi2 = _interopRequireDefault(_floodApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var httpServer = _http2.default.createServer(app);
var io = new _socket.Server(httpServer);

app.use(_express2.default.static("public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

_torrentSearchApi2.default.enablePublicProviders();

var settings = JSON.parse(_fs2.default.readFileSync("./settings.json", { encoding: "utf8", flag: "r" }));
console.log(settings);
var api = new _floodApi2.default({
    baseUrl: settings.flood_uri + '/api',
    username: settings.flood_username,
    password: settings.flood_password
});

api.client.connectionTest().then(function (resp) {
    return console.log(resp);
});

io.on("connection", function (socket) {
    socket.emit('directories', settings.directories);
    socket.emit('flood_link', settings.flood_uri);

    socket.on("search", function (msg) {
        _torrentSearchApi2.default.search(msg).then(function (torrents) {
            socket.emit("searchResult", torrents.filter(function (e) {
                return !!e.magnet;
            }));
        });
    });

    socket.on("add_to_flood", function (request) {
        console.log('flood_request', request);
        api.torrents.addUrls({
            urls: [request.magnet],
            destination: request.destination,
            start: true
        }).then(function (response) {
            console.log('flood response', response);

            var success = Array.isArray(response) && response.length === 1 && response[0] === '0';
            socket.emit("add_to_flood_response", success);
        });
    });
});

httpServer.listen(settings.port, function () {
    console.log("listening on " + settings.port);
});