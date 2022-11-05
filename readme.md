# General

Small repo to host a simple server providing an interface to the [Torrent search api](https://www.npmjs.com/package/torrent-search-api) for easily adding torrents to [Flood](https://github.com/jesec/flood) 

**!Note:** run locally, no auth added.

# 1) Install dependencies


`npm install`

# 2) Fill in Settings

Fill in the settings.json file:

```json
{
    "port": 3001,
    "flood_username": "",
    "flood_password": "",
    "flood_uri": "http://192.168.0.123:3000",
    "directories": [
        "/mnt/TVShows",
        "/mnt/Movies"
    ]
}
```

# 3) Run

`npm run start`
