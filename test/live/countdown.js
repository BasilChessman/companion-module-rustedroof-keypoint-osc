// Media length and countdown on the test deck's video (slide 4): play, seek, ending-soon feedback.
export default async (h) => {
	const show = () => {
		const v = h.vars
		const ending = h.feedback('media_ending', { seconds: 10, playing: true })
		return `${v.media_state} pos=${v.media_position_display} len=${v.media_duration_display} left=${v.media_remaining_display} (${v.media_remaining}) ending10=${ending}`
	}
	await h.wait(1500)
	await h.press('select_app', { app: 'powerpoint' })
	await h.press('start', { slide: 4 })
	await h.wait(3500)
	console.log('arrived   ', show())
	await h.press('media', { mode: 'play' })
	for (let k = 0; k < 3; k++) {
		await h.wait(1000)
		console.log('playing   ', show())
	}
	await h.press('media_seek_percent', { percent: 50 })
	await h.wait(800)
	console.log('50%       ', show())
	await h.press('media_seek', { mode: 'beforeend', ms: 12000 })
	for (let k = 0; k < 14; k++) {
		await h.wait(1000)
		console.log('near end  ', show())
	}
	await h.press('previous')
	await h.wait(2000)
	console.log('prev slide', `slide=${h.vars.current_slide}`, show())
	await h.press('end')
	await h.press('select_app', { app: 'auto' })
	await h.wait(1000)
}
