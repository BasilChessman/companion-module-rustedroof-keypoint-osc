import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodeMessage, decodePacket, messageText, textArg } from '../src/osc.js'
import { COMMANDS } from '../src/commands.js'
import { KeyPointState, formatTime } from '../src/state.js'
import { VARIABLES } from '../src/variables.js'

const s = (value) => ({ type: 's', value })
const i = (value) => ({ type: 'i', value })
const b = (str) => ({ type: 'b', value: Buffer.from(str, 'utf8') })

test('OSC: matches the spec example', () => {
	const data = encodeMessage('/oscillator/4/frequency', [{ type: 'f', value: 440 }])
	assert.equal(data.toString('hex'), '2f6f7363696c6c61746f722f342f6672657175656e6379002c66000043dc0000')
})

test('OSC: round trips all argument types', () => {
	const args = [i(-5), { type: 'f', value: 1.5 }, s('hé'), b('ünïcödé ✓'), { type: 'T', value: true }, { type: 'F', value: false }]
	const [m] = decodePacket(encodeMessage('/keypoint/x', args))
	assert.equal(m.address, '/keypoint/x')
	assert.deepEqual(m.args, args)
})

test('OSC: pads blobs of every length', () => {
	for (let n = 0; n < 6; n++) {
		const blob = { type: 'b', value: Buffer.alloc(n, 7) }
		const data = encodeMessage('/b', [blob, i(9)])
		assert.equal(data.length % 4, 0)
		assert.deepEqual(decodePacket(data)[0].args, [blob, i(9)])
	}
})

test('OSC: decodes bundles and rejects garbage', () => {
	const m1 = encodeMessage('/a', [i(1)])
	const m2 = encodeMessage('/b')
	const size = (buf) => {
		const x = Buffer.alloc(4)
		x.writeInt32BE(buf.length)
		return x
	}
	const bundle = Buffer.concat([Buffer.from('#bundle\0'), Buffer.alloc(8), size(m1), m1, size(m2), m2])
	assert.deepEqual(
		decodePacket(bundle).map((m) => m.address),
		['/a', '/b'],
	)
	assert.throws(() => decodePacket(Buffer.from([1, 2, 3])))
	assert.throws(() => decodePacket(m1.subarray(0, m1.length - 2)))
})

test('OSC: text helpers', () => {
	assert.deepEqual(textArg('Intro'), s('Intro'))
	assert.deepEqual(textArg('Médias'), b('Médias'))
	assert.equal(messageText([s('Caf?'), b('Café')]), 'Café')
	assert.equal(messageText([s('plain')]), 'plain')
})

test('commands: every action builds a /keypoint message with defaults', () => {
	for (const [id, command] of Object.entries(COMMANDS)) {
		const defaults = Object.fromEntries(command.options.map((o) => [o.id, o.default]))
		const message = command.build(defaults)
		const needsText = command.options.some((o) => o.type === 'textinput' && !o.label.includes('empty'))
		if (needsText) {
			assert.equal(message, null, `${id} should refuse an empty text option`)
			continue
		}
		assert.ok(message.address.startsWith('/keypoint/'), id)
		encodeMessage(message.address, message.args) // must encode
	}
})

test('commands: specific messages', () => {
	assert.deepEqual(COMMANDS.goto_slide.build({ slide: 4 }), { address: '/keypoint/goto/slide', args: [i(4)] })
	assert.deepEqual(COMMANDS.start.build({ slide: 0 }), { address: '/keypoint/slideshow/start', args: [] })
	assert.deepEqual(COMMANDS.start.build({ slide: 3 }).args, [i(3)])
	assert.deepEqual(COMMANDS.black.build({ mode: 'toggle' }).args, [])
	assert.deepEqual(COMMANDS.white.build({ mode: 'off' }).args, [i(0)])
	assert.deepEqual(COMMANDS.goto_section.build({ section: 'Médias' }).args, [b('Médias')])
	assert.equal(COMMANDS.media_seek.build({ mode: 'back', ms: 5000 }).address, '/keypoint/media/goto/position/back')
	assert.deepEqual(COMMANDS.media_seek.build({ mode: 'beforeend', ms: 10000 }), {
		address: '/keypoint/media/goto/position/beforeend',
		args: [i(10000)],
	})
	assert.deepEqual(COMMANDS.media_seek_percent.build({ percent: 150 }).args, [{ type: 'f', value: 100 }])
	assert.equal(COMMANDS.files_close.build({ name: '', mode: 'force' }).address, '/keypoint/files/close/force')
	assert.deepEqual(COMMANDS.files_close.build({ name: '', mode: 'abort' }).args, [])
	assert.deepEqual(COMMANDS.select_app.build({ app: 'keynote' }), { address: '/keypoint/app/select', args: [s('keynote')] })
})

test('state: show feedback becomes variables', () => {
	const st = new KeyPointState()
	assert.deepEqual(st.apply('/keypoint/slideshow/state', [s('running')]), ['show_state'])
	st.apply('/keypoint/slideshow/currentslide', [i(4)])
	st.apply('/keypoint/presentation/name', [s('D?ck.pptx'), b('Déck.pptx')])
	st.apply('/keypoint/slideshow/notes-utf8', [b('Notes ✓\rline 2')])
	st.apply('/keypoint/slideshow/media/position', [i(75500)])
	st.apply('/keypoint/slideshow/overlay', [s('black')])
	assert.equal(st.values.current_slide, 4)
	assert.equal(st.values.presentation_name, 'Déck.pptx')
	assert.equal(st.values.notes, 'Notes ✓\rline 2')
	assert.equal(st.values.media_position_display, '1:15')
	assert.equal(st.values.overlay, 'black')
	assert.ok(st.inShow)
	// Unchanged values report no change.
	assert.deepEqual(st.apply('/keypoint/slideshow/currentslide', [i(4)]), [])
	// Ending the show clears show-only values.
	st.apply('/keypoint/slideshow/state', [s('edit')])
	assert.equal(st.values.current_slide, '')
	assert.equal(st.values.notes, '')
	assert.equal(st.values.overlay, 'none')
	assert.equal(st.values.presentation_name, 'Déck.pptx')
})

test('state: media length and countdown', () => {
	const st = new KeyPointState()
	st.apply('/keypoint/slideshow/state', [s('running')])
	st.apply('/keypoint/slideshow/media/state', [s('playing')])
	st.apply('/keypoint/slideshow/media/position', [i(4000)])
	st.apply('/keypoint/slideshow/media/duration', [i(59078)])
	const changed = st.apply('/keypoint/slideshow/media/durationtrimmed', [i(29078)])
	assert.deepEqual(changed, ['media_duration', 'media_duration_display'])
	st.apply('/keypoint/slideshow/media/remaining', [i(25078)])
	assert.equal(st.values.media_duration_display, '0:30') // rounded up, like the countdown
	assert.equal(st.values.media_remaining, 25078)
	assert.equal(st.values.media_remaining_display, '0:26') // counts down to 0:00 at the end
	// Length not known: cleared.
	st.apply('/keypoint/slideshow/media/remaining', [s('')])
	assert.equal(st.values.media_remaining_display, '')
	// A slide without media clears everything media.
	st.apply('/keypoint/slideshow/media/remaining', [i(1000)])
	st.apply('/keypoint/slideshow/media/state', [s('')])
	for (const k of ['media_state', 'media_position', 'media_position_display', 'media_duration', 'media_remaining_display'])
		assert.equal(st.values[k], '', k)
})

test('state: JSON lists, capabilities and foreign prefixes', () => {
	const st = new KeyPointState()
	st.apply('/keypoint/v2/presentations', [s('[{"name":"A.pptx"},{"name":"B\\u00e9.key"}]')])
	assert.equal(st.values.presentations, 'A.pptx, Bé.key')
	assert.deepEqual(st.apply('/keypoint/capabilities', [s('["navigate","media"]')]), ['capabilities'])
	assert.ok(st.supports('media') && !st.supports('sections'))
	assert.deepEqual(st.apply('/keypoint/capabilities', [s('["media","navigate"]')]), [])
	st.apply('/keypoint/v2/files', [s('[{"name":"Show.pptx"}]')])
	assert.equal(st.values.files, 'Show.pptx')
	st.apply('/keypoint/v2/files/enabled', [{ type: 'T', value: true }])
	assert.equal(st.values.files_enabled, true)
	assert.equal(st.apply('/oscpoint/slideshow/currentslide', [i(2)]), null)
	assert.deepEqual(st.apply('/keypoint/something/new', [i(2)]), [])
	assert.deepEqual(st.apply('/keypoint/v2/presentations', [s('not json')]), ['presentations'])
})

test('state: every value has a variable definition', () => {
	const st = new KeyPointState()
	for (const key of Object.keys(st.values)) assert.ok(key in VARIABLES, `${key} has no variable definition`)
})

test('formatTime', () => {
	assert.equal(formatTime(0), '0:00')
	assert.equal(formatTime(61999), '1:01')
	assert.equal(formatTime(''), '')
	assert.equal(formatTime(1, true), '0:01')
	assert.equal(formatTime(60000, true), '1:00')
})
