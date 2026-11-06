// Prints the slide and section counters for the running show.
export default async (h) => {
	await h.wait(2500)
	const v = h.vars
	console.log(`app ${v.app} slide ${v.current_slide} slides_remaining ${v.slides_remaining} section_slides_remaining ${v.section_slides_remaining}`)
	await h.press('next')
	await h.wait(2000)
	console.log(`app ${v.app} slide ${v.current_slide} slides_remaining ${v.slides_remaining} section_slides_remaining ${v.section_slides_remaining}`)
}
