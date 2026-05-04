# Kitboga Code Jam 2026

<p align="center">
  <img src="./submission/KnR Logo.png" width="350" alt="Kind and Rewind Logo" />
</p>

This repository contains the code for our entry "Kind and Rewind" in the Kitboga Code Jam 2026. The project is a combination of video and UI that recreates the experience of unskippable internet ads but with escalating consequences for each skip attempt.

## Key Features

- The button is smaller than the UI implies, yet hovering the cursor over any part of the area provides UX feedback as if a click SHOULD work.
- Every skip attempt has a cooldown.
- **Escalation 0:** Plays a sound effect on click .
- **Escalation 1:** Plays a guilt trip video after 3 attempts.
- **Escalation 2:** Displays a small **X** button after 7 attempts.
  -  The **X** button is what can actually skip the ad.


## The Video

"Kind and Rewind” is a deliberately overlong and meandering VHS restoration advertisement. Framed as a small-town business expanding to the internet for the first time, founder and CEO Kim Wexler goes into painstaking detail about this strange business.

It's designed to be believable at first but increasingly difficult to sit through, recreating the experience of an unskippable ad overstaying its welcome.


## Config

Difficulty can be changed in `submission/guilt.js` by setting the `DIFFICULTY` constant near the top of the file:

```js
const DIFFICULTY = 'normal'; // 'easy', 'normal', or 'hard'
```

| Setting | Easy | Normal | Hard |
|---|---|---|---|
| Skip cooldown | 2500ms | 4000ms | 5500ms |
| Escalation 1 (guilt video) | 2 attempts | 3 attempts | 4 attempts |
| Escalation 2 (X button) | 4 attempts | 6 attempts | 8 attempts |

Individual values can also be tweaked directly inside the preset objects in `DIFFICULTY_PRESETS`.

## Team
Alex - froggydogworld (Discord)

Ena - CombustibleToast (Github), combustibletoast (Discord)

Flower - jestpurr

Chris - countchrisdo (Github and Discord)

### Credits
**Video** - Flower (Kim Wexler), Chris, Alex

**Logo** - Chris

**UI** - Ena, Chris

**Voice Clip** - Ena
