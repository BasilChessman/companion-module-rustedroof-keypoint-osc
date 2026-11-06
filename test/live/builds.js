// Steps through a slide with builds and prints the build variables and feedback.
// Start a slide show on a slide with builds first (the next slide should have none).
export default async (h) => {
	const show = (label) => {
		const v = h.vars
		console.log(
			`${label.padEnd(10)} slide ${v.current_slide} build ${v.build_position}/${v.build_count} left ${v.build_remaining}` +
				` remaining-feedback ${h.feedback('builds_remaining')}`,
		)
	}
	await h.wait(2500)
	show('start')
	for (let i = 1; i <= 4; i++) {
		await h.press('next')
		await h.wait(3000)
		show(`next ${i}`)
	}
	for (let i = 1; i <= 2; i++) {
		await h.press('previous')
		await h.wait(3000)
		show(`prev ${i}`)
	}
}
