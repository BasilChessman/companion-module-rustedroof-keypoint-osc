// Runs the real module (src/main.js) against a running KeyPoint OSC app, with a
// fake Companion host in place of @companion-module/base.
//   node test/live/harness.js <mac-ip> <script.js>
// The script exports async (h) => {...} and can use h.press(actionId, options),
// h.vars, h.feedback(id, options), h.status, h.wait(ms).
const Module = require('node:module')
const path = require('node:path')
const real = require('@companion-module/base')

let ModuleClass = null
const fake = {
	...real,
	runEntrypoint: (cls) => {
		ModuleClass = cls
	},
	InstanceBase: class {
		constructor() {
			this.label = 'keypoint'
			this.vars = {}
			this.status = null
			this.logs = []
		}
		setActionDefinitions(d) {
			this.actions = d
		}
		setFeedbackDefinitions(d) {
			this.feedbacks = d
		}
		setVariableDefinitions(d) {
			this.variableDefinitions = d
		}
		setPresetDefinitions(structure, presets) {
			this.presetStructure = structure
			this.presets = presets
		}
		setVariableValues(v) {
			Object.assign(this.vars, v)
		}
		checkAllFeedbacks() {}
		checkFeedbacks() {}
		updateStatus(status, message) {
			this.status = message ? `${status}: ${message}` : status
		}
		log(level, message) {
			this.logs.push(`${level}: ${message}`)
		}
	},
}
const load = Module._load
Module._load = function (request, ...rest) {
	return request === '@companion-module/base' ? fake : load.call(this, request, ...rest)
}

async function main() {
	const [host, scriptPath] = process.argv.slice(2)
	require('../../src/main.js')
	const instance = new ModuleClass({})
	const wait = (ms) => new Promise((r) => setTimeout(r, ms))
	await instance.init({ host, port: 35551 }, true, undefined)
	const h = {
		instance,
		wait,
		get vars() {
			return instance.vars
		},
		get status() {
			return instance.status
		},
		press: async (id, options = {}) => {
			const def = instance.actions[id]
			const defaults = Object.fromEntries(def.options.map((o) => [o.id, o.default]))
			await def.callback({ options: { ...defaults, ...options } })
		},
		feedback: (id, options = {}) => instance.feedbacks[id].callback({ options }),
	}
	try {
		await require(path.resolve(scriptPath))(h)
	} finally {
		await instance.destroy()
		if (instance.logs.length) console.log('module log:', instance.logs.join(' | '))
	}
}
main().catch((e) => {
	console.error(e)
	process.exit(1)
})
