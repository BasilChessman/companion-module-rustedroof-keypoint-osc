// Prints media state at short intervals after play/pause/stop, to see feedback lag.
module.exports = async (h) => {
	await h.wait(1500)
	await h.press('select_app', { app: 'powerpoint' })
	await h.press('start', { slide: 4 })
	await h.wait(3500)
	for (const mode of ['play', 'pause', 'play', 'stop']) {
		await h.press('media', { mode })
		const t0 = Date.now()
		const seen = []
		while (Date.now() - t0 < 2000) {
			await h.wait(100)
			const s = `${h.vars.media_state}@${h.vars.media_position}`
			if (seen[seen.length - 1]?.s !== s) seen.push({ t: Date.now() - t0, s })
		}
		console.log(mode.padEnd(6), seen.map((x) => `${x.t}ms:${x.s}`).join('  '))
	}
	await h.press('end')
	await h.press('select_app', { app: 'auto' })
	await h.wait(1000)
}
