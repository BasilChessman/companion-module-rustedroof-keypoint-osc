## KeyPoint OSC

Controls **PowerPoint for Mac** and **Keynote** slide shows through the KeyPoint OSC menu-bar app on the presentation Mac.

### Setup

1. On the Mac, open KeyPoint OSC (0.1 or later) and note the IP shown in its menu as **This Mac**.
2. Here, enter:
   - **Mac IP address**: that IP.
   - **Send port**: KeyPoint's listen port, **35551** unless you changed it in the KeyPoint menu.
   - **Receive port**: the UDP port on this Companion computer that KeyPoint replies to. Give every KeyPoint connection its own port (for example 35560, 35561, …); 0 picks any free port. Allow it in this computer's firewall if replies don't arrive.

No feedback settings are needed in KeyPoint: it replies to whichever port each connection sends from. Its "Feedback to" settings only apply to other OSC clients, such as the Zinc: OSCPoint module, which can keep running alongside this one.

The connection shows **OK** once KeyPoint answers. It checks every few seconds and shows an error if KeyPoint stops answering (Mac asleep, app quit, firewall), or if the receive port is already used by another connection.

### Several Macs

Add one KeyPoint OSC connection per Mac, each with that Mac's IP and its own receive port. Variables and feedbacks are per connection, e.g. `$(keypoint_a:current_slide)` and `$(keypoint_b:current_slide)`.

KeyPoint picks the app automatically: the one with a slide show running, otherwise the one used most recently. Use the **Select app** action to fix the choice.

### What works in each app

| | PowerPoint | Keynote |
|---|---|---|
| Next / previous, first / last, go to slide | ✅ | ✅ |
| Sections (go to, start from, variables) | ✅ | — |
| Black / white screen | ✅ | ✅ |
| Pause / resume auto-advance | ✅ | — |
| Media play / pause / stop / seek | ✅ | — |
| Media length and time remaining | ✅ from the saved file | ⚠️ estimate only, see below |
| Media state | ✅ | ⚠️ estimate only |
| Build count and builds remaining | ✅ | — |
| Notes, slide counts, slides remaining | ✅ | ✅ |

Use the **Current app supports** feedback to grey out buttons the current app can't do (the media and black/white presets already do this).

Notes:

- **Go to slide** in PowerPoint restarts the show at that slide, so the screen flickers briefly. That's a PowerPoint for Mac limitation.
- **Build position** is counted from KeyPoint's own next/previous commands. Clicks made directly on the Mac aren't seen until the slide changes.
- **File actions** (open, close, folder) only work after **Allow file open/close over OSC** is turned on in the KeyPoint menu on the Mac.

### Variables

`$(keypoint:current_slide)`, `slide_count`, `slides_remaining`, `presentation_name`, `notes`, `section_name`, `build_position`, `build_count`, `media_position_display`, `media_remaining_display`, `media_duration_display`, `app`, `show_state`, `overlay`, `connected` and more. Replace `keypoint` with your connection's label. The full list is under Variables for this connection.

### Presets

Ready-made buttons for navigation, show control, black/white, info displays (slide counter, builds, notes, section), media (including a countdown that turns amber at 30 s and red at 10 s), app selection, and clicker on/off buttons (clicker keys, PerfectCue bridge). The media countdown shows **≈ LEFT** when the time is an estimate.

## Media countdown (PowerPoint)

PowerPoint doesn't report a video's length, so KeyPoint reads it from the saved presentation file. Trims made in PowerPoint are taken into account. Save the deck after adding or trimming a video; changes that aren't saved yet aren't seen. Online videos have no length. Use the **Media ending soon** feedback to colour a button when a set number of seconds is left.

## Media countdown (Keynote): an estimate

Keynote doesn't report whether a movie is playing or how far it has got, so **the Keynote values are KeyPoint's estimate, not a live reading**. KeyPoint reads the saved deck for when the movie starts (when the slide appears, on a click, or after or with another build, plus delays) and for its trims, then counts down from that moment. Pausing or skimming the movie on the Mac isn't seen. A movie that starts on a click waits (`notready`) until the click: one sent through KeyPoint (**Next**), a clicker key on the Mac, or a PerfectCue press (see below). Mouse clicks on the Mac aren't seen. Save the deck before the show. See the KeyPoint OSC README for the full list of cases.

- **Media time is an estimate (Keynote)** feedback, and the `media_estimated` variable, tell you when the values are estimated, for example to show "≈" on a countdown.
- **Media time remaining at or below (ending soon)** colours a button when the time left drops to a number of seconds, in both apps.

## Clicker keys (Keynote)

Most clickers plug into the Mac and send keys (Page Down, → and so on). KeyPoint can watch for those keys so the press times Keynote movies that start on a click or after a build.

- **Clicker keys: listen / stop** action: *Listen*, *Stop listening* or *Toggle*.
- **Clicker keys** feedback: *Listening (permission granted)*, *Listening is on*, or *Listening is on, but Input Monitoring is missing*. The preset button is amber until the permission is granted and green once KeyPoint is listening.
- Variables: `keyboard_enabled`, `keyboard_permission`.

KeyPoint needs **Input Monitoring** on the Mac (System Settings > Privacy & Security > Input Monitoring); click **Allow…** in the KeyPoint menu. It only listens: keys aren't blocked, changed or stored, and only clicker keys going to Keynote during a show count. The default keys are the ones Keynote uses; if your clicker sends something else, use **Learn** in the KeyPoint menu on the Mac.

## PerfectCue clicker (Keynote)

If the show is advanced with a DSAN PerfectCue and a [PerfectCue bridge](https://github.com/BasilChessman/perfectcue-bridge) is on the network, KeyPoint can listen to the bridge, so clicker presses (and presses sent from the Dsan: PerfectCue module) start Keynote movies' countdowns at the right moment.

- **PerfectCue bridge: listen / stop** action: *Listen*, *Stop listening* or *Toggle*. Host and port are optional; empty keeps KeyPoint's current setting (`perfectcue.local`, 5100 at first). KeyPoint remembers the choice and reconnects on its own.
- **PerfectCue bridge** feedback: *Connected*, *Listening is on*, or *Listening is on, but not connected*. The preset button is amber while KeyPoint can't reach the bridge and green once connected.
- Variables: `perfectcue_enabled`, `perfectcue_connected`.

Only turn this on for the KeyPoint on the Mac that the PerfectCue base station's USB is plugged into: KeyPoint assumes every press reached its Keynote. The bridge accepts up to 4 connections, so the Dsan: PerfectCue module and KeyPoint can use it at the same time. If KeyPoint also listens for clicker keys and the base station's USB is on the same Mac, a press arrives both ways; KeyPoint counts it once.

The clicker and estimate features need KeyPoint OSC 0.3.0 or later.
