# Steam Changelog

## [Remove AI Recommendation] - {PR_MERGE_DATE}

- Remove the AI game recommendation from the main view, which ran an AI request every time the command opened. Ask Raycast AI with @steam instead

## [Open in Steam] - {PR_MERGE_DATE}

- Add an Open in Steam link to game details
- Steam app actions now open Steam directly instead of your browser

## [Bug Fixes] - {PR_MERGE_DATE}

- Fix an error when only one of Web API Key and Steam ID is set
- Clear Recent History now clears only your recently viewed games
- Report unexpected Steam network errors so they can be fixed

## [Fix Game Details] - {PR_MERGE_DATE}

- Fix game details showing "Game not found" for every game

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
