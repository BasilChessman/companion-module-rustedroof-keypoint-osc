// PerfectCue action and feedback against KeyPoint, with a stand-in bridge on this computer:
//   node test/live/harness.js 127.0.0.1 test/live/perfectcue.js
// Leaves KeyPoint's PerfectCue setting off, at perfectcue.local:5100.
import net from 'node:net'

export default async function (h) {
	const clients = []
	const bridge = net.createServer((c) => clients.push(c))
	await new Promise((r) => bridge.listen(0, '127.0.0.1', r))
	const port = bridge.address().port
	const show = (label) =>
		console.log(
			label,
			JSON.stringify({ enabled: h.vars.perfectcue_enabled, connected: h.vars.perfectcue_connected }),
			'feedback connected:',
			h.feedback('perfectcue', { state: 'connected' }),
			'not connected:',
			h.feedback('perfectcue', { state: 'not_connected' }),
		)
	try {
		await h.wait(1500)
		show('start')
		await h.press('perfectcue', { mode: 'enable', host: '127.0.0.1', port: String(port) })
		await h.wait(1500)
		show('listen')
		console.log('bridge sees', clients.length, 'connection(s)')
		clients.forEach((c) => c.destroy())
		bridge.close()
		await h.wait(1500)
		show('bridge gone')
		await h.press('perfectcue', { mode: 'toggle' })
		await h.wait(1000)
		show('toggle')
	} finally {
		await h.press('perfectcue', { mode: 'enable', host: 'perfectcue.local', port: '5100' })
		await h.press('perfectcue', { mode: 'disable' })
		await h.wait(1000)
		show('restored')
	}
}
