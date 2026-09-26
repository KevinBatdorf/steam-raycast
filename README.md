# Steam

[![](https://shields.io/badge/Raycast-Cross--Extension-eee?labelColor=FF6363&logo=raycast&logoColor=fff&style=flat-square)](https://github.com/LitoMore/raycast-cross-extension-conventions)

Search and view information about any game on steam, as well as games you own.

Get an API token here (optional): https://steamcommunity.com/dev/apikey

With a Web API key, search runs from a local list of every Steam game, which the extension downloads once and then keeps up to date. Without a key, search is powered by this public repo: https://github.com/KevinBatdorf/steam-api

Source repo: https://github.com/KevinBatdorf/steam-raycast

Notes:

- While rare, you may hit the Steam API rate limit. If that's the case, just wait a few moments and try again.
- Sometimes the Steam API sends a random language. There doesn't seem to be any logic to this. Just press escape and try again.
- Sometimes games are removed from Steam yet still show in the API. To avoid extra network costs, the extension will just provide feedback that the game no longer exists.
- Search results show icons for the top matches Steam's own app search returns. Other results show an icon only if you own the game.

## Features

- Search all games on Steam
- Search only your games
- View details about a game
- Filter your search
- Browse SteamGridDB images (requires [SteamGridDB](https://raycast.com/litomore/steamgriddb) extension)
- Browse ProtonDB scores (requires [ProtonDB](https://raycast.com/litomore/protondb) extension)
- Ask Raycast AI about your library, what you played lately, and game news, or have it launch or install a game
