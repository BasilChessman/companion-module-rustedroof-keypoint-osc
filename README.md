# companion-module-rustedroof-keypoint-osc

[Bitfocus Companion](https://bitfocus.io/companion) module for [KeyPoint OSC](https://github.com/BasilChessman/KeyPoint-OSC), a macOS menu-bar app that controls PowerPoint for Mac and Keynote slide shows over OSC.

See [companion/HELP.md](companion/HELP.md) for setup, actions, feedbacks, variables and presets.

## Development

Requires Node.js 26.

```sh
npm install
npm test              # unit tests (OSC codec, actions, state)
npm run package       # builds rustedroof-keypoint-osc-<version>.tgz for "Import module package" in Companion,
                      # then loads it the way Companion does (test/package-check.js)
node test/live/harness.js <mac-ip> test/live/smoke.js   # runs the module against a running KeyPoint OSC app
node test/live/multi.js <mac-ip>                        # two connections with their own receive ports, plus a port conflict
```

`test/live/harness.js` loads `src/main.js` with the real SDK and a stand-in for Companion's connection context, so the module's actions, feedbacks and variables can be exercised against the real app without Companion. `show.js` and `media.js` drive a PowerPoint show.

## License

MIT. See [LICENSE](LICENSE).
