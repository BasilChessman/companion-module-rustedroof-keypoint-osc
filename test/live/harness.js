// Runs the real module (src/main.js, with the real SDK) against a running KeyPoint OSC
// app, using a stand-in for Companion's context.
//   node test/live/harness.js <mac-ip> <script.js>
// The script default-exports async (h) => {...} and can use h.press(actionId, options),
// h.vars, h.feedback(id, options), h.status, h.wait(ms).
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createFakeContext, loadLikeCompanion } from '../fake-context.js'

const [host, scriptPath] = process.argv.slice(2)
const { ctor } = await loadLikeCompanion(new URL('../../src/main.js', import.meta.url).href)
const { context, record } = createFakeContext()
const instance = new ctor(context)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await instance.init({ host, port: 35551 }, true, undefined)
const h = {
	instance,
	record,
	wait,
	get vars() {
		return record.vars
	},
	get status() {
		return record.status
	},
	press: async (id, options = {}) => {
		const def = record.actions[id]
		const defaults = Object.fromEntries(def.options.map((o) => [o.id, o.default]))
		await def.callback({ options: { ...defaults, ...options } }, {})
	},
	feedback: (id, options = {}) => record.feedbacks[id].callback({ options }, {}),
}
try {
	const script = await import(pathToFileURL(path.resolve(scriptPath)).href)
	await script.default(h)
} finally {
	await instance.destroy()
}
