// Feedback state: applies incoming /keypoint/... messages and exposes Companion
// variable values. Free of Companion APIs so it can be unit-tested.
import { messageText } from './osc.js'

const PREFIX = '/keypoint/'

// Values only meaningful during a show; cleared when it ends.
const SHOW_KEYS = [
	'current_slide',
	'slides_remaining',
	'build_position',
	'build_count',
	'build_remaining',
	'notes',
	'section_index',
	'section_name',
	'section_slides_remaining',
	'media_state',
	'media_position',
	'overlay',
]

function emptyValues() {
	return {
		app: 'none',
		presentation_name: '',
		slide_count: 0,
		slide_count_visible: 0,
		show_state: 'edit',
		current_slide: '',
		slides_remaining: '',
		build_position: '',
		build_count: '',
		build_remaining: '',
		notes: '',
		section_index: '',
		section_name: '',
		section_slides_remaining: '',
		media_state: '',
		media_position: '',
		media_position_display: '',
		overlay: 'none',
		presentations: '',
		files: '',
		files_enabled: false,
		active_folder: '',
		last_event: '',
		version: '',
	}
}

/** Formats milliseconds as m:ss. */
function formatTime(ms) {
	if (ms === '' || ms === undefined || ms === null || Number.isNaN(Number(ms))) return ''
	const total = Math.max(0, Math.floor(Number(ms) / 1000))
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

class KeyPointState {
	constructor() {
		this.values = emptyValues()
		this.capabilities = new Set()
		this.presentationList = []
		this.fileList = []
		this.sections = []
	}

	reset() {
		this.values = emptyValues()
		this.capabilities = new Set()
		this.presentationList = []
		this.fileList = []
		this.sections = []
	}

	/**
	 * Applies one message. Returns the names of changed variables, plus 'capabilities'
	 * when the capability list changed, or null if the address isn't KeyPoint feedback.
	 */
	apply(address, args) {
		if (!address.startsWith(PREFIX)) return null
		const path = address.slice(PREFIX.length)
		const before = { ...this.values }
		const first = args[0]
		const num = first && typeof first.value === 'number' ? first.value : undefined
		const text = messageText(args)
		const v = this.values
		let capsChanged = false

		switch (path) {
			case 'pong':
				v.version = text ?? ''
				break
			case 'app':
				v.app = text ?? 'none'
				break
			case 'capabilities': {
				const list = safeJSON(text, [])
				const next = new Set(Array.isArray(list) ? list : [])
				capsChanged = next.size !== this.capabilities.size || [...next].some((c) => !this.capabilities.has(c))
				this.capabilities = next
				break
			}
			case 'presentation/name':
				v.presentation_name = text ?? ''
				break
			case 'presentation/slides/count':
				v.slide_count = num ?? 0
				break
			case 'presentation/slides/count/visible':
				v.slide_count_visible = num ?? 0
				break
			case 'v2/presentation': {
				const p = safeJSON(text, null)
				this.sections = Array.isArray(p?.sections) ? p.sections : []
				if (p && p.name === '') {
					// Nothing open.
					v.presentation_name = ''
					v.slide_count = 0
					v.slide_count_visible = 0
				}
				break
			}
			case 'v2/presentations': {
				const list = safeJSON(text, [])
				this.presentationList = Array.isArray(list) ? list.map((p) => p.name).filter(Boolean) : []
				v.presentations = this.presentationList.join(', ')
				break
			}
			case 'v2/files': {
				const list = safeJSON(text, [])
				this.fileList = Array.isArray(list) ? list.map((f) => f.name).filter(Boolean) : []
				v.files = this.fileList.join(', ')
				break
			}
			case 'v2/files/enabled':
				v.files_enabled = first?.value === true
				break
			case 'v2/files/activefolder':
				v.active_folder = text ?? ''
				break
			case 'v2/event':
				v.last_event = argsText(args[0]) ?? ''
				if (v.last_event === 'slideshow_end') this.clearShow()
				break
			case 'slideshow/state':
				v.show_state = text ?? 'edit'
				if (v.show_state === 'edit') this.clearShow()
				break
			case 'slideshow/overlay':
				v.overlay = text ?? 'none'
				break
			case 'slideshow/currentslide':
				v.current_slide = num ?? ''
				break
			case 'slideshow/slidesremaining':
				v.slides_remaining = num ?? ''
				break
			case 'slideshow/builds/position':
				v.build_position = num ?? ''
				break
			case 'slideshow/builds/count':
				v.build_count = num ?? ''
				break
			case 'slideshow/builds/remaining':
				v.build_remaining = num ?? ''
				break
			case 'slideshow/notes-utf8':
				v.notes = text ?? ''
				break
			case 'slideshow/notes':
				break // the UTF-8 version is used
			case 'slideshow/section/index':
				v.section_index = num ?? ''
				break
			case 'slideshow/section/name':
				v.section_name = text ?? ''
				break
			case 'slideshow/section/slidesremaining':
				v.section_slides_remaining = num ?? ''
				break
			case 'slideshow/media/state':
				v.media_state = text ?? ''
				break
			case 'slideshow/media/position':
				v.media_position = num ?? ''
				v.media_position_display = formatTime(num)
				break
			default:
				return []
		}
		const changed = Object.keys(v).filter((k) => v[k] !== before[k])
		if (capsChanged) changed.push('capabilities')
		return changed
	}

	clearShow() {
		const blank = emptyValues()
		for (const k of SHOW_KEYS) this.values[k] = blank[k]
		this.values.media_position_display = ''
	}

	get inShow() {
		return this.values.show_state === 'running' || this.values.show_state === 'paused'
	}

	supports(capability) {
		return this.capabilities.has(capability)
	}
}

function safeJSON(text, fallback) {
	if (typeof text !== 'string') return fallback
	try {
		return JSON.parse(text)
	} catch {
		return fallback
	}
}

function argsText(arg) {
	return arg && arg.type === 's' ? arg.value : undefined
}

export { KeyPointState, formatTime }
