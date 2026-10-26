const GREEN = 0x00a000
const RED = 0xc00000
const AMBER = 0xd08000
const WHITE = 0xffffff
const BLACK = 0x000000

const CAPABILITIES = [
	{ id: 'navigate', label: 'Next / previous' },
	{ id: 'gotoSlide', label: 'Go to slide' },
	{ id: 'sections', label: 'Sections' },
	{ id: 'hideSlides', label: 'Hide slides' },
	{ id: 'startShow', label: 'Start show' },
	{ id: 'endShow', label: 'End show' },
	{ id: 'blackWhite', label: 'Black / white screen' },
	{ id: 'pauseResume', label: 'Pause / resume' },
	{ id: 'media', label: 'Media control' },
	{ id: 'buildCount', label: 'Build count' },
	{ id: 'buildPosition', label: 'Build position' },
	{ id: 'notes', label: 'Notes' },
	{ id: 'openClose', label: 'Open / close files' },
	{ id: 'activatePresentation', label: 'Switch presentation' },
]

module.exports = function (self) {
	const v = () => self.state.values
	self.setFeedbackDefinitions({
		connected: {
			type: 'boolean',
			name: 'Connected to KeyPoint',
			description: 'KeyPoint OSC is answering',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [],
			callback: () => self.connected,
		},
		show_state: {
			type: 'boolean',
			name: 'Slide show state',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'in_show',
					choices: [
						{ id: 'in_show', label: 'Show running (or paused)' },
						{ id: 'running', label: 'Running' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'edit', label: 'Not in a show' },
					],
				},
			],
			callback: (fb) => (fb.options.state === 'in_show' ? self.state.inShow : v().show_state === fb.options.state),
		},
		overlay: {
			type: 'boolean',
			name: 'Black / white screen is on',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [
				{
					id: 'overlay',
					type: 'dropdown',
					label: 'Screen',
					default: 'black',
					choices: [
						{ id: 'black', label: 'Black' },
						{ id: 'white', label: 'White' },
					],
				},
			],
			callback: (fb) => v().overlay === fb.options.overlay,
		},
		current_slide: {
			type: 'boolean',
			name: 'Current slide is',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [{ id: 'slide', type: 'number', label: 'Slide number', default: 1, min: 1, max: 10000, asInteger: true }],
			callback: (fb) => self.state.inShow && Number(v().current_slide) === Number(fb.options.slide),
		},
		builds_remaining: {
			type: 'boolean',
			name: 'Current slide has builds remaining (PowerPoint)',
			defaultStyle: { bgcolor: AMBER, color: BLACK },
			options: [],
			callback: () => self.state.inShow && Number(v().build_remaining) > 0,
		},
		last_slide: {
			type: 'boolean',
			name: 'On the last visible slide',
			defaultStyle: { bgcolor: AMBER, color: BLACK },
			options: [],
			callback: () => self.state.inShow && v().slides_remaining === 0,
		},
		section: {
			type: 'boolean',
			name: 'Current section is (PowerPoint)',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [{ id: 'section', type: 'textinput', label: 'Section name', default: '', useVariables: true }],
			callback: (fb) => self.state.inShow && v().section_name !== '' && v().section_name === String(fb.options.section),
		},
		presentation: {
			type: 'boolean',
			name: 'Current presentation is',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [{ id: 'name', type: 'textinput', label: 'File name', default: '', useVariables: true }],
			callback: (fb) => v().presentation_name !== '' && v().presentation_name === String(fb.options.name),
		},
		app: {
			type: 'boolean',
			name: 'App in use',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [
				{
					id: 'app',
					type: 'dropdown',
					label: 'App',
					default: 'powerpoint',
					choices: [
						{ id: 'powerpoint', label: 'PowerPoint' },
						{ id: 'keynote', label: 'Keynote' },
						{ id: 'none', label: 'None open' },
					],
				},
			],
			callback: (fb) => v().app === fb.options.app,
		},
		media_state: {
			type: 'boolean',
			name: 'Media state (PowerPoint)',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'playing',
					choices: [
						{ id: 'playing', label: 'Playing' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'stopped', label: 'Stopped' },
					],
				},
			],
			callback: (fb) => self.state.inShow && v().media_state === fb.options.state,
		},
		supports: {
			type: 'boolean',
			name: 'Current app supports',
			description: 'For example, grey out media buttons when Keynote is in use',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [{ id: 'capability', type: 'dropdown', label: 'Feature', default: 'media', choices: CAPABILITIES }],
			callback: (fb) => self.state.supports(fb.options.capability),
		},
		files_enabled: {
			type: 'boolean',
			name: 'File access is enabled on the Mac',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [],
			callback: () => v().files_enabled === true,
		},
	})
}

module.exports.CAPABILITIES = CAPABILITIES
