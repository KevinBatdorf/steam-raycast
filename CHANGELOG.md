# Steam Changelog

## [Local Search, New AI Tools, and Fixes] - {PR_MERGE_DATE}

- Fix game details showing "Game not found" for every game
- With a Web API Key, search runs from a local list of every Steam game, so results appear instantly. A new Game List Refresh preference sets how often it checks Steam for new games
- Show game icons in search results, including games you don't own, and rank exact title matches first
- Show game details beside search results with Show Details, and add a View News action to every game
- Add AI tools for your owned games, recently played games, and game news, and tools to launch or install a game after you confirm
- Add an Open in Steam link to game details, and open Steam directly from Steam actions instead of going through your browser
- Tell users without a Web API Key, once, that a future version will require one
- Remove the AI game recommendation from the main view, which ran an AI request every time the command opened
- Fix an error when only one of Web API Key and Steam ID is set
- Load release dates as you move through search results, and explain empty searches and libraries instead of showing a blank list
- Clear Recent History now clears only your recently viewed games
- Stop keeping an on-disk cache that grew with every game viewed, and update to Raycast API 2

## [New Feature] - 2026-06-29

- Add a Search Users command for looking up Steam profiles
- Add a Steam users AI tool for Raycast AI queries
- Add reusable AI tools for Steam game search and game details

## [Update] - 2025-11-08

- Toggled on windows support
- Fixed some typos and deprecation warnings

## [Routine Maintenance] - 2025-08-26

- Remove the typo dependency `data-fns`
- Drop redundant `node-fetch` dependency
- Bump all dependencies to the latest

## [New Feature] - 2024-10-14

- Add support for browsing ProtonDB scores

## [New Feature & Chore] - 2024-10-07

- Add support for browsing SteamGridDB images
- Bump all dependencies to the latest

## [Add AI Recommendation] - 2023-05-23

Added an AI game recommendation to the main view

## [Bug Fixes] - 2022-09-18

Fixed a bug where when recently played games is empty, it would remain in the loading state
Removed screenshot duplication in README

## [Update] - 2022-07-14

Fixed path of the used images in README

## [Added Steam] - 2022-05-30

Initial version code
