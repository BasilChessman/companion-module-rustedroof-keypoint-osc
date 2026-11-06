export const VARIABLES = {
	connected: 'Connected to KeyPoint (true/false)',
	version: 'KeyPoint OSC version',
	app: 'App in use (powerpoint, keynote, none)',
	presentation_name: 'Presentation file name',
	presentations: 'Open presentations (comma separated)',
	slide_count: 'Number of slides',
	slide_count_visible: 'Number of slides, excluding hidden ones',
	show_state: 'Show state (edit, running, paused)',
	current_slide: 'Current slide number',
	slides_remaining: 'Visible slides after the current one',
	build_position: 'Builds shown on the current slide',
	build_count: 'Clicks the current slide\'s builds take',
	build_remaining: 'Build clicks left on the current slide',
	notes: 'Presenter notes of the current slide',
	section_index: 'Current section number (PowerPoint)',
	section_name: 'Current section name (PowerPoint)',
	section_slides_remaining: 'Visible slides left in the section (PowerPoint)',
	overlay: 'Black/white screen (none, black, white)',
	media_state: 'Media state (playing, paused, stopped, notready; Keynote: estimated)',
	media_position: 'Media position in ms',
	media_position_display: 'Media position (m:ss)',
	media_duration: 'Media length in ms, after trimming',
	media_duration_display: 'Media length (m:ss)',
	media_remaining: 'Media time remaining in ms (Keynote: estimated)',
	media_remaining_display: 'Media time remaining (m:ss)',
	media_estimated: 'Media values are an estimate, not read from the app (true for Keynote)',
	files_enabled: 'File access enabled on the Mac (true/false)',
	perfectcue_enabled: 'KeyPoint is set to listen to a PerfectCue bridge (true/false)',
	perfectcue_connected: 'KeyPoint is connected to the PerfectCue bridge (true/false)',
	keyboard_enabled: 'KeyPoint is set to listen for clicker keys on the Mac (true/false)',
	keyboard_permission: 'Input Monitoring is granted to KeyPoint on the Mac (true/false)',
	active_folder: 'Active folder for file actions',
	files: 'Presentations in the active folder (after "refresh file list")',
	last_event: 'Last event from KeyPoint (e.g. slideshow_begin)',
}

export default function UpdateVariableDefinitions(self) {
	const definitions = {}
	for (const [id, name] of Object.entries(VARIABLES)) definitions[id] = { name }
	self.setVariableDefinitions(definitions)
}

