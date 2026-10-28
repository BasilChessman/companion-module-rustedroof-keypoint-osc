// Action table: options shown in Companion, and the OSC message each action sends.
// Kept free of Companion APIs so it can be unit-tested.
import { textArg } from './osc.js'

const PREFIX = '/keypoint'

const int = (n) => ({ type: 'i', value: Math.round(Number(n)) })
const msg = (path, args = []) => ({ address: `${PREFIX}/${path}`, args })

const onOffToggle = {
	id: 'mode',
	type: 'dropdown',
	label: 'Mode',
	default: 'toggle',
	choices: [
		{ id: 'toggle', label: 'Toggle' },
		{ id: 'on', label: 'On' },
		{ id: 'off', label: 'Off' },
	],
}
const slideNumber = { id: 'slide', type: 'number', label: 'Slide number', default: 1, min: 1, max: 10000, asInteger: true }
const textOption = (id, label, tooltip) => ({ id, type: 'textinput', label, default: '', useVariables: true, tooltip })

const toggleArgs = (mode) => (mode === 'on' ? [int(1)] : mode === 'off' ? [int(0)] : [])

/** id -> { name, description?, options, build(options) -> message | null } */
const COMMANDS = {
	next: { name: 'Next (slide or build)', options: [], build: () => msg('next') },
	previous: { name: 'Previous (slide or build)', options: [], build: () => msg('previous') },
	goto_slide: {
		name: 'Go to slide',
		description: 'PowerPoint restarts the show at the slide (a brief flicker).',
		options: [slideNumber],
		build: (o) => msg('goto/slide', [int(o.slide)]),
	},
	goto_first: { name: 'Go to first slide', options: [], build: () => msg('goto/slide/first') },
	goto_last: { name: 'Go to last slide', options: [], build: () => msg('goto/slide/last') },
	goto_section: {
		name: 'Go to section (PowerPoint)',
		options: [textOption('section', 'Section name', 'Case sensitive')],
		build: (o) => (o.section ? msg('goto/section', [textArg(String(o.section))]) : null),
	},
	slide_visibility: {
		name: 'Hide / unhide slide',
		options: [
			slideNumber,
			{
				id: 'hidden',
				type: 'dropdown',
				label: 'Action',
				default: 'hide',
				choices: [
					{ id: 'hide', label: 'Hide' },
					{ id: 'unhide', label: 'Unhide' },
				],
			},
		],
		build: (o) => msg(o.hidden === 'unhide' ? 'slide/unhide' : 'slide/hide', [int(o.slide)]),
	},
	start: {
		name: 'Start slide show',
		options: [
			{
				id: 'slide',
				type: 'number',
				label: 'From slide (0 = beginning)',
				default: 0,
				min: 0,
				max: 10000,
				asInteger: true,
			},
		],
		build: (o) => msg('slideshow/start', Number(o.slide) > 0 ? [int(o.slide)] : []),
	},
	start_current: { name: 'Start slide show from current slide', options: [], build: () => msg('slideshow/start/current') },
	start_section: {
		name: 'Start slide show from section (PowerPoint)',
		options: [textOption('section', 'Section name', 'Case sensitive')],
		build: (o) => (o.section ? msg('slideshow/start/section', [textArg(String(o.section))]) : null),
	},
	end: { name: 'End slide show', options: [], build: () => msg('slideshow/end') },
	black: {
		name: 'Black screen',
		options: [onOffToggle],
		build: (o) => msg('slideshow/black', toggleArgs(o.mode)),
	},
	white: {
		name: 'White screen',
		options: [onOffToggle],
		build: (o) => msg('slideshow/white', toggleArgs(o.mode)),
	},
	pause_resume: {
		name: 'Pause / resume auto-advance (PowerPoint)',
		options: [
			{
				id: 'mode',
				type: 'dropdown',
				label: 'Action',
				default: 'pause',
				choices: [
					{ id: 'pause', label: 'Pause' },
					{ id: 'resume', label: 'Resume' },
				],
			},
		],
		build: (o) => msg(o.mode === 'resume' ? 'slideshow/resume' : 'slideshow/pause'),
	},
	media: {
		name: 'Media: play / pause / stop (PowerPoint)',
		description: 'Controls the first video or audio item on the current slide.',
		options: [
			{
				id: 'mode',
				type: 'dropdown',
				label: 'Action',
				default: 'playpause',
				choices: [
					{ id: 'playpause', label: 'Play/pause toggle' },
					{ id: 'play', label: 'Play' },
					{ id: 'pause', label: 'Pause' },
					{ id: 'stop', label: 'Stop' },
				],
			},
		],
		build: (o) => msg(`media/${['play', 'pause', 'stop'].includes(o.mode) ? o.mode : 'playpause'}`),
	},
	media_seek: {
		name: 'Media: seek (PowerPoint)',
		options: [
			{
				id: 'mode',
				type: 'dropdown',
				label: 'Seek',
				default: 'forward',
				choices: [
					{ id: 'forward', label: 'Forward by' },
					{ id: 'back', label: 'Back by' },
					{ id: 'fromstart', label: 'To position from start' },
					{ id: 'beforeend', label: 'To position before end' },
				],
			},
			{ id: 'ms', type: 'number', label: 'Milliseconds', default: 10000, min: 0, max: 86400000, asInteger: true },
		],
		build: (o) =>
			msg(`media/goto/position/${['back', 'fromstart', 'beforeend'].includes(o.mode) ? o.mode : 'forward'}`, [int(o.ms)]),
	},
	media_seek_percent: {
		name: 'Media: seek to percent (PowerPoint)',
		options: [{ id: 'percent', type: 'number', label: 'Percent', default: 50, min: 0, max: 100, step: 1 }],
		build: (o) => msg('media/goto/position/percent', [{ type: 'f', value: Math.min(Math.max(Number(o.percent) || 0, 0), 100) }]),
	},
	media_bookmark: {
		name: 'Media: next / previous bookmark (PowerPoint)',
		options: [
			{
				id: 'direction',
				type: 'dropdown',
				label: 'Bookmark',
				default: 'next',
				choices: [
					{ id: 'next', label: 'Next' },
					{ id: 'previous', label: 'Previous' },
				],
			},
		],
		build: (o) => msg(`media/goto/bookmark/${o.direction === 'previous' ? 'previous' : 'next'}`),
	},
	activate_presentation: {
		name: 'Switch to open presentation',
		options: [textOption('name', 'File name', 'For example "Show.pptx". See the $(…:presentations) variable.')],
		build: (o) => (o.name ? msg('presentations/activate', [textArg(String(o.name))]) : null),
	},
	select_app: {
		name: 'Select app',
		description: 'Which app KeyPoint controls. Automatic follows the app with a show running.',
		options: [
			{
				id: 'app',
				type: 'dropdown',
				label: 'App',
				default: 'auto',
				choices: [
					{ id: 'auto', label: 'Automatic' },
					{ id: 'powerpoint', label: 'PowerPoint' },
					{ id: 'keynote', label: 'Keynote' },
				],
			},
		],
		build: (o) => msg('app/select', [{ type: 's', value: String(o.app || 'auto') }]),
	},
	files_setpath: {
		name: 'Files: set active folder',
		description: 'Relative to the home folder on the Mac. Needs file access enabled in the KeyPoint menu.',
		options: [textOption('path', 'Folder', 'For example "Desktop/Shows"')],
		build: (o) => (o.path ? msg('files/setpath', [textArg(String(o.path))]) : null),
	},
	files_list: { name: 'Files: refresh file list', options: [], build: () => msg('files/list') },
	files_open: {
		name: 'Files: open presentation',
		description: 'Opens a file from the active folder. Needs file access enabled in the KeyPoint menu.',
		options: [textOption('name', 'File name', 'For example "Show.pptx". See the $(…:files) variable.')],
		build: (o) => (o.name ? msg('files/open', [textArg(String(o.name))]) : null),
	},
	files_close: {
		name: 'Files: close presentation',
		options: [
			textOption('name', 'File name (empty = active presentation)'),
			{
				id: 'mode',
				type: 'dropdown',
				label: 'If there are unsaved changes',
				default: 'abort',
				choices: [
					{ id: 'abort', label: "Don't close" },
					{ id: 'force', label: 'Close and discard changes' },
					{ id: 'save', label: 'Save over the file, then close' },
				],
			},
		],
		build: (o) => {
			const path = o.mode === 'force' ? 'files/close/force' : o.mode === 'save' ? 'files/close/save' : 'files/close'
			return msg(path, o.name ? [textArg(String(o.name))] : [])
		},
	},
	remote_control: {
		name: 'KeyPoint: enable / disable OSC actions',
		description: 'While disabled, KeyPoint ignores everything except "enable".',
		options: [
			{
				id: 'enabled',
				type: 'dropdown',
				label: 'Actions',
				default: 'enable',
				choices: [
					{ id: 'enable', label: 'Enable' },
					{ id: 'disable', label: 'Disable' },
				],
			},
		],
		build: (o) => msg(o.enabled === 'disable' ? 'actions/disable' : 'actions/enable'),
	},
	refresh: { name: 'KeyPoint: refresh feedback', options: [], build: () => msg('feedbacks/refresh') },
}

export { COMMANDS, PREFIX }
