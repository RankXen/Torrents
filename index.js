const express = require('express');
const TorrentSearchApi = require('torrent-search-api');
const fs = require('fs');
const debounce = require('debounce');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const request = require('request');
const copy = require('copy-to-clipboard')

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

TorrentSearchApi.enablePublicProviders();


io.on('connection', function (socket) {
    socket.on('search', function (msg) {
        console.log('Msg:', msg);
        TorrentSearchApi.search(msg, 'All', 100).then((torrents) => {
            socket.emit(
                'searchResult',
                torrents.filter((e) => !!e.magnet)
            );
        });
    });


});


http.listen(3001, function () {
    console.log('listening on *:3001');
});
