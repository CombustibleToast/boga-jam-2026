# Kitboga Code Jam 2026

<p align="center">
  <img src="./submission/KnR Logo.png" width="350" alt="Kind and Rewind Logo" />
</p>

This repository contains the code for our entry "Kind and Rewind" in the Kitboga Code Jam 2026. The project is a combination of video and UI that recreates the experience of unskippable internet ads but with escalating consequences for each skip attempt.

## Key Features

- The button is smaller than the UI implies, yet hovering the cursor over any part of the area provides UX feedback as if a click SHOULD work.
- Every skip attempt has a cooldown.
- Plays a sound effect on click (escalation 0).
- Plays a guilt trip video after 3 attempts (escalation 1).
- Displays a small X button after 7 attempts (escalation 2).
- [X] button is the thing that actually skips.


## The Video

"Kind and Rewind” is a deliberately overlong and meandering VHS restoration advertisement. Framed as a small-town business expanding to the internet for the first time, founder and CEO Kim Wexler goes into painstaking detail about this strange business.

It's designed to be believable at first but increasingly difficult to sit through, recreating the experience of an unskippable ad overstaying its welcome.


## Config

Key timing constants in `guilt.js`:
- **Main ad duration**: 3 min 55 seconds (235 seconds)
- **Guilt ad start time**: X seconds
- **Skip cooldown**: 4000ms (4 seconds)
- **Escalation 1 threshold**: 3 attempts
- **Escalation 2 threshold**: 6 attempts

