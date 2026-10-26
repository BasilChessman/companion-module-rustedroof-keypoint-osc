const WHITE = 0xffffff
const BLACK = 0x000000
const DARK = 0x202020
const GREEN = 0x00a000
const RED = 0xc00000
const BLUE = 0x0050a0
const GREY = 0x404040

function button(name, text, actionId, options = {}, extra = {}) {
	return {
		type: 'simple',
		name,
		style: { text, size: extra.size ?? '18', color: WHITE, bgcolor: extra.bgcolor ?? DARK },
		steps: [{ down: [{ actionId, options }], up: [] }],
		feedbacks: extra.feedbacks ?? [],
	}
}

function display(name, text, extra = {}) {
	return {
		type: 'simple',
		name,
		style: { text, size: extra.size ?? '14', color: WHITE, bgcolor: BLACK },
		steps: [],
		feedbacks: extra.feedbacks ?? [],
	}
}

const unsupported = (capability) => ({
	feedbackId: 'supports',
	options: { capability },
	isInverted: true,
	style: { bgcolor: GREY, color: 0x808080 },
})

module.exports = function (self) {
	const v = (name) => `$(${self.label}:${name})`
	const inShow = { feedbackId: 'show_state', options: { state: 'in_show' }, style: { bgcolor: GREEN, color: WHITE } }

	const presets = {
		next: button('Next', 'NEXT ▶', 'next', {}, { size: '24', bgcolor: BLUE }),
		previous: button('Previous', '◀ PREV', 'previous', {}, { size: '24', bgcolor: BLUE }),
		first: button('First slide', '⏮ FIRST', 'goto_first'),
		last: button('Last slide', 'LAST ⏭', 'goto_last'),
		goto: button('Go to slide 1', 'GO TO\\n1', 'goto_slide', { slide: 1 }, {
			feedbacks: [{ feedbackId: 'current_slide', options: { slide: 1 }, style: { bgcolor: GREEN, color: WHITE } }],
		}),
		start: button('Start show', 'START', 'start', { slide: 0 }, { feedbacks: [inShow] }),
		start_current: button('Start from current slide', 'START\\nCURRENT', 'start_current', {}, { size: '14', feedbacks: [inShow] }),
		end: button('End show', 'END', 'end', {}, { bgcolor: RED }),
		black: button('Black screen', 'BLACK', 'black', { mode: 'toggle' }, {
			feedbacks: [
				{ feedbackId: 'overlay', options: { overlay: 'black' }, style: { bgcolor: WHITE, color: BLACK, text: 'BLACK\\nON' } },
				unsupported('blackWhite'),
			],
		}),
		white: button('White screen', 'WHITE', 'white', { mode: 'toggle' }, {
			feedbacks: [
				{ feedbackId: 'overlay', options: { overlay: 'white' }, style: { bgcolor: WHITE, color: BLACK, text: 'WHITE\\nON' } },
				unsupported('blackWhite'),
			],
		}),
		slide_counter: display('Slide counter', `SLIDE\\n${v('current_slide')}/${v('slide_count')}`, {
			size: '18',
			feedbacks: [{ feedbackId: 'last_slide', options: {}, style: { bgcolor: 0x803000 } }],
		}),
		builds: display('Builds', `BUILD\\n${v('build_position')}/${v('build_count')}`, {
			feedbacks: [{ feedbackId: 'builds_remaining', options: {}, style: { bgcolor: 0x806000 } }],
		}),
		remaining: display('Slides remaining', `LEFT\\n${v('slides_remaining')}`, { size: '18' }),
		presentation: display('Presentation name', v('presentation_name'), { size: '7' }),
		section: display('Section name', `SECTION\\n${v('section_name')}`, { size: '7' }),
		notes: display('Notes', v('notes'), { size: '7' }),
		status: display('Connection', `KEYPOINT\\n${v('app')}`, {
			feedbacks: [
				{ feedbackId: 'connected', options: {}, style: { bgcolor: GREEN } },
				{ feedbackId: 'connected', options: {}, isInverted: true, style: { bgcolor: RED, text: 'KEYPOINT\\nOFFLINE' } },
			],
		}),
		media_playpause: button('Media play/pause', 'MEDIA\\n⏯', 'media', { mode: 'playpause' }, {
			feedbacks: [
				{ feedbackId: 'media_state', options: { state: 'playing' }, style: { bgcolor: GREEN } },
				unsupported('media'),
			],
		}),
		media_stop: button('Media stop', 'MEDIA\\n⏹', 'media', { mode: 'stop' }, { feedbacks: [unsupported('media')] }),
		media_back: button('Media back 10 s', '⏪ 10s', 'media_seek', { mode: 'back', ms: 10000 }, { feedbacks: [unsupported('media')] }),
		media_forward: button('Media forward 10 s', '10s ⏩', 'media_seek', { mode: 'forward', ms: 10000 }, {
			feedbacks: [unsupported('media')],
		}),
		media_time: display('Media position', `MEDIA\\n${v('media_position_display')}`, { size: '18' }),
		app_auto: button('App: automatic', 'APP\\nAUTO', 'select_app', { app: 'auto' }, { size: '14' }),
		app_powerpoint: button('App: PowerPoint', 'APP\\nPPT', 'select_app', { app: 'powerpoint' }, {
			size: '14',
			feedbacks: [{ feedbackId: 'app', options: { app: 'powerpoint' }, style: { bgcolor: GREEN } }],
		}),
		app_keynote: button('App: Keynote', 'APP\\nKEYNOTE', 'select_app', { app: 'keynote' }, {
			size: '14',
			feedbacks: [{ feedbackId: 'app', options: { app: 'keynote' }, style: { bgcolor: GREEN } }],
		}),
	}

	const structure = [
		{ id: 'navigation', name: 'Navigation', definitions: ['previous', 'next', 'first', 'last', 'goto'] },
		{ id: 'show', name: 'Slide show', definitions: ['start', 'start_current', 'end', 'black', 'white'] },
		{
			id: 'info',
			name: 'Info displays',
			definitions: ['slide_counter', 'builds', 'remaining', 'presentation', 'section', 'notes', 'status'],
		},
		{
			id: 'media',
			name: 'Media (PowerPoint)',
			definitions: ['media_playpause', 'media_stop', 'media_back', 'media_forward', 'media_time'],
		},
		{ id: 'app', name: 'App selection', definitions: ['app_auto', 'app_powerpoint', 'app_keynote'] },
	]

	self.setPresetDefinitions(structure, presets)
}
