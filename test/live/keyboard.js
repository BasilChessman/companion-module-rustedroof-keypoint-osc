// Clicker keys action and feedback against KeyPoint:
//   node test/live/harness.js 127.0.0.1 test/live/keyboard.js
// Puts KeyPoint's "Listen for clicker keys" back the way it was.
export default async function (h) {
	await h.wait(1500)
	const show = (label) =>
		console.log(label, JSON.stringify({ enabled: h.vars.keyboard_enabled, permission: h.vars.keyboard_permission }),
			'listening:', h.feedback('keyboard_clicker', { state: 'listening' }),
			'no permission:', h.feedback('keyboard_clicker', { state: 'no_permission' }))
	const before = h.vars.keyboard_enabled
	show('start')
	try {
		await h.press('keyboard_clicker', { mode: 'toggle' })
		await h.wait(1000)
		show('toggled')
		await h.press('keyboard_clicker', { mode: 'toggle' })
		await h.wait(1000)
		show('toggled back')
	} finally {
		await h.press('keyboard_clicker', { mode: before === true ? 'enable' : 'disable' })
		await h.wait(500)
	}
}
