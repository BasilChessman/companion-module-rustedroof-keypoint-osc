## KeyPoint OSC

Controls **PowerPoint for Mac** and **Keynote** slide shows through the KeyPoint OSC menu-bar app on the presentation Mac.

### Setup

1. On the Mac, open KeyPoint OSC (0.1 or later) and note the IP shown in its menu as **This Mac**.
2. Here, enter that IP as **Mac IP address**. Leave the port at **35551** unless you changed it in KeyPoint.

No feedback settings are needed. KeyPoint answers this connection directly, and its "Feedback to" settings only apply to other OSC clients, such as the Zinc: OSCPoint module, which can keep running alongside this one.

The connection shows **OK** once KeyPoint answers. It checks every few seconds and shows an error if KeyPoint stops answering (Mac asleep, app quit, firewall). If it stays on "Waiting", check that the Mac's firewall allows incoming connections for KeyPoint OSC.

KeyPoint picks the app automatically: the one with a slide show running, otherwise the one used most recently. Use the **Select app** action to fix the choice.

### What works in each app

| | PowerPoint | Keynote |
|---|---|---|
| Next / previous, first / last, go to slide | ✅ | ✅ |
| Sections (go to, start from, variables) | ✅ | — |
| Black / white screen | ✅ | ✅ |
| Pause / resume auto-advance | ✅ | — |
| Media play / pause / stop / seek | ✅ | — |
| Build count and builds remaining | ✅ | — |
| Notes, slide counts, slides remaining | ✅ | ✅ |

Use the **Current app supports** feedback to grey out buttons the current app can't do (the media and black/white presets already do this).

Notes:

- **Go to slide** in PowerPoint restarts the show at that slide, so the screen flickers briefly. That's a PowerPoint for Mac limitation.
- **Build position** is counted from KeyPoint's own next/previous commands. Clicks made directly on the Mac aren't seen until the slide changes.
- **File actions** (open, close, folder) only work after **Allow file open/close over OSC** is turned on in the KeyPoint menu on the Mac.

### Variables

`$(keypoint:current_slide)`, `slide_count`, `slides_remaining`, `presentation_name`, `notes`, `section_name`, `build_position`, `build_count`, `media_position_display`, `app`, `show_state`, `overlay`, `connected` and more. Replace `keypoint` with your connection's label. The full list is under Variables for this connection.

### Presets

Ready-made buttons for navigation, show control, black/white, info displays (slide counter, builds, notes, section), media and app selection.
