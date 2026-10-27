// A stand-in for the context object Companion passes to a module instance, so the
// real InstanceBase from @companion-module/base can be constructed outside Companion.
export function createFakeContext(label = 'keypoint') {
	const record = {
		actions: null,
		feedbacks: null,
		variableDefinitions: null,
		presetStructure: null,
		presets: null,
		vars: {},
		status: null,
		checked: 0,
	}
	const context = {
		_isInstanceContext: true,
		id: 'test-connection',
		label,
		upgradeScripts: [],
		sharedUdpSocketHandlers: new Map(),
		sharedUdpSocketJoin: async () => 'handle',
		sharedUdpSocketLeave: async () => {},
		sharedUdpSocketSend: async () => {},
		saveConfig: () => {},
		updateStatus: (status, message) => {
			record.status = message ? `${status}: ${message}` : status
		},
		oscSend: () => {},
		recordAction: () => {},
		setActionDefinitions: (d) => (record.actions = d),
		subscribeActions: () => {},
		unsubscribeActions: () => {},
		setFeedbackDefinitions: (d) => (record.feedbacks = d),
		unsubscribeFeedbacks: () => {},
		checkFeedbacks: () => record.checked++,
		checkAllFeedbacks: () => record.checked++,
		checkFeedbacksById: () => record.checked++,
		setPresetDefinitions: (structure, presets) => {
			record.presetStructure = structure
			record.presets = presets
		},
		setCompositeElementDefinitions: () => {},
		setVariableDefinitions: (d) => (record.variableDefinitions = d),
		setVariableValues: (v) => Object.assign(record.vars, v),
		getVariableValue: (id) => record.vars[id],
	}
	return { context, record }
}

/** Loads a module entry file the way Companion 5.x's ConnectionThread does. */
export async function loadLikeCompanion(entryUrl) {
	const t = await import(entryUrl)
	const ctor = typeof t === 'function' ? t : t.default
	if (typeof ctor !== 'function') throw new Error('Module entrypoint did not return a valid constructor function')
	const upgradeScripts = t.UpgradeScripts ?? []
	if (!Array.isArray(upgradeScripts)) throw new Error('Module entrypoint upgradeScripts is not an array')
	return { ctor, upgradeScripts }
}
