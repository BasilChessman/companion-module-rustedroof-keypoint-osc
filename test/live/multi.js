// Two connections to the same KeyPoint with fixed, different receive ports, plus a
// third that reuses a port and must report the conflict.
//   node test/live/multi.js <mac-ip>
import { createFakeContext, loadLikeCompanion } from '../fake-context.js'

const host = process.argv[2] ?? '127.0.0.1'
const { ctor } = await loadLikeCompanion(new URL('../../src/main.js', import.meta.url).href)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const make = async (label, receivePort) => {
	const { context, record } = createFakeContext(label)
	const instance = new ctor(context)
	await instance.init({ host, port: 35551, receivePort }, true, undefined)
	return { label, receivePort, instance, record }
}
const a = await make('keypoint_a', 35560)
const b = await make('keypoint_b', 35561)
await wait(1500)
const c = await make('keypoint_c', 35560)
await wait(2500)
for (const x of [a, b, c]) {
	console.log(`${x.label} receive=${x.receivePort} connected=${x.record.vars.connected} status=${x.record.status} ` +
		`version=${x.record.vars.version || '-'} socket=${x.instance.socket ? x.instance.socket.address().port : 'closed'}`)
}
for (const x of [a, b, c]) await x.instance.destroy()
