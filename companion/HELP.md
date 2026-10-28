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
| Media length and time remaining | ✅ from the saved file | — |
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

Ready-made buttons for navigation, show control, black/white, info displays (slide counter, builds, notes, section), media (including a countdown that turns amber at 30 s and red at 10 s) and app selection.

## Media countdown (PowerPoint)

PowerPoint doesn't report a video's length, so KeyPoint reads it from the saved presentation file. Trims made in PowerPoint are taken into account. Save the deck after adding or trimming a video; changes that aren't saved yet aren't seen. Online videos have no length. Use the **Media ending soon** feedback to colour a button when a set number of seconds is left.
