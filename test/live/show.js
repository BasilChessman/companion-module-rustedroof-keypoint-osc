// Drives a PowerPoint show through the module's actions and prints what the module sees.
module.exports = async (h) => {
	const v = h.vars
	const show = (label) =>
		console.log(
			`${label.padEnd(22)} slide=${v.current_slide} build=${v.build_position}/${v.build_count} left=${v.slides_remaining}` +
				` section=${v.section_name || '-'} overlay=${v.overlay} media=${v.media_state || '-'}@${v.media_position_display || '-'}` +
				` state=${v.show_state} app=${v.app}`,
		)
	const step = async (label, id, options, ms = 900) => {
		await h.press(id, options)
		await h.wait(ms)
		show(label)
	}
	await h.wait(2000)
	console.log('status:', h.status, '| connected feedback:', h.feedback('connected'))
	await step('select PowerPoint', 'select_app', { app: 'powerpoint' }, 1500)
	await step('start', 'start', { slide: 0 }, 3000)
	console.log('  in-show feedback:', h.feedback('show_state', { state: 'in_show' }), '| current slide is 1:', h.feedback('current_slide', { slide: 1 }))
	await step('next', 'next')
	await step('next (build)', 'next')
	console.log('  builds remaining feedback:', h.feedback('builds_remaining'))
	await step('previous', 'previous')
	await step('goto section Media', 'goto_section', { section: 'Media' }, 4000)
	await step('black on', 'black', { mode: 'on' })
	console.log('  overlay black feedback:', h.feedback('overlay', { overlay: 'black' }))
	await step('black off', 'black', { mode: 'off' })
	await step('media play', 'media', { mode: 'play' }, 2500)
	console.log('  media playing feedback:', h.feedback('media_state', { state: 'playing' }))
	await step('media pause', 'media', { mode: 'pause' })
	await step('media stop', 'media', { mode: 'stop' })
	console.log('  notes:', JSON.stringify(v.notes), '| presentation:', v.presentation_name)
	await step('end', 'end', {}, 1500)
	console.log('  in-show feedback after end:', h.feedback('show_state', { state: 'in_show' }), '| last event:', v.last_event)
	await step('select automatic', 'select_app', { app: 'auto' }, 1200)
}
