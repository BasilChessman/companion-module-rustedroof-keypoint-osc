// Connection, presets/definitions sanity, and edit-mode feedback.
export default async (h) => {
	await h.wait(2500)
	const v = h.vars
	console.log('status:', h.status)
	console.log('connected:', v.connected, '| version:', v.version, '| app:', v.app)
	console.log('presentation:', v.presentation_name, '| slides:', v.slide_count, 'visible:', v.slide_count_visible, '| state:', v.show_state)
	console.log('open:', v.presentations)
	console.log('supports media:', h.feedback('supports', { capability: 'media' }), '| sections:', h.feedback('supports', { capability: 'sections' }))
	console.log('definitions: actions', Object.keys(h.record.actions).length, 'feedbacks', Object.keys(h.record.feedbacks).length,
		'variables', Object.keys(h.record.variableDefinitions).length, 'presets', Object.keys(h.record.presets).length)
	const unknown = Object.keys(v).filter((k) => !(k in h.record.variableDefinitions))
	console.log('values without definitions:', unknown.length ? unknown : 'none')
}
