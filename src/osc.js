// Minimal OSC 1.0 encoder/decoder for the types KeyPoint OSC uses.
// Arguments are { type, value } with type one of: i (int32), f (float32), s (string),
// b (Buffer blob), T/F (booleans), h (int64 as BigInt), d (double), N (nil).

function pad4(n) {
	return (4 - (n % 4)) % 4
}

function encodeString(str) {
	const bytes = Buffer.from(str, 'utf8')
	return Buffer.concat([bytes, Buffer.alloc(1 + pad4(bytes.length + 1))])
}

function encodeMessage(address, args = []) {
	const parts = [encodeString(address), encodeString(',' + args.map((a) => a.type).join(''))]
	for (const arg of args) {
		switch (arg.type) {
			case 'i': {
				const b = Buffer.alloc(4)
				b.writeInt32BE(arg.value)
				parts.push(b)
				break
			}
			case 'f': {
				const b = Buffer.alloc(4)
				b.writeFloatBE(arg.value)
				parts.push(b)
				break
			}
			case 's':
				parts.push(encodeString(arg.value))
				break
			case 'b': {
				const len = Buffer.alloc(4)
				len.writeInt32BE(arg.value.length)
				parts.push(len, arg.value, Buffer.alloc(pad4(arg.value.length)))
				break
			}
			case 'T':
			case 'F':
			case 'N':
				break
			default:
				throw new Error(`Unsupported OSC type ${arg.type}`)
		}
	}
	return Buffer.concat(parts)
}

class Reader {
	constructor(buf) {
		this.buf = buf
		this.pos = 0
	}
	get atEnd() {
		return this.pos >= this.buf.length
	}
	need(n) {
		if (n < 0 || this.pos + n > this.buf.length) throw new Error('Truncated OSC packet')
	}
	string() {
		const end = this.buf.indexOf(0, this.pos)
		if (end < 0) throw new Error('Unterminated OSC string')
		const s = this.buf.toString('utf8', this.pos, end)
		this.pos = end + 1 + pad4(end - this.pos + 1)
		if (this.pos > this.buf.length) throw new Error('Truncated OSC packet')
		return s
	}
	int32() {
		this.need(4)
		const v = this.buf.readInt32BE(this.pos)
		this.pos += 4
		return v
	}
	bytes(n) {
		this.need(n)
		const v = this.buf.subarray(this.pos, this.pos + n)
		this.pos += n
		return v
	}
}

/** Decodes a packet into a flat list of messages: { address, args }. */
function decodePacket(buf, depth = 0) {
	const r = new Reader(buf)
	if (buf.length > 0 && buf[0] === 0x23) {
		// "#bundle"
		if (depth > 8) throw new Error('OSC bundle nesting too deep')
		if (r.string() !== '#bundle') throw new Error('Bad OSC bundle')
		r.bytes(8) // time tag: executed immediately
		const out = []
		while (!r.atEnd) {
			const size = r.int32()
			out.push(...decodePacket(r.bytes(size), depth + 1))
		}
		return out
	}
	const address = r.string()
	if (!address.startsWith('/')) throw new Error('Bad OSC address')
	if (r.atEnd) return [{ address, args: [] }]
	const tags = r.string()
	if (!tags.startsWith(',')) throw new Error('Bad OSC type tags')
	const args = []
	for (const t of tags.slice(1)) {
		switch (t) {
			case 'i':
				args.push({ type: 'i', value: r.int32() })
				break
			case 'f':
				r.need(4)
				args.push({ type: 'f', value: buf.readFloatBE(r.pos) })
				r.pos += 4
				break
			case 's':
			case 'S':
				args.push({ type: 's', value: r.string() })
				break
			case 'b': {
				const n = r.int32()
				args.push({ type: 'b', value: Buffer.from(r.bytes(n)) })
				r.bytes(pad4(n))
				break
			}
			case 'h':
				r.need(8)
				args.push({ type: 'h', value: buf.readBigInt64BE(r.pos) })
				r.pos += 8
				break
			case 'd':
				r.need(8)
				args.push({ type: 'd', value: buf.readDoubleBE(r.pos) })
				r.pos += 8
				break
			case 't':
				r.bytes(8)
				break
			case 'T':
				args.push({ type: 'T', value: true })
				break
			case 'F':
				args.push({ type: 'F', value: false })
				break
			case 'N':
			case 'I':
				args.push({ type: t, value: null })
				break
			default:
				throw new Error(`Unsupported OSC type tag ${t}`)
		}
	}
	return [{ address, args }]
}

/** Text from an argument: strings as-is, blobs decoded as UTF-8 (KeyPoint/OSCPoint convention). */
function argText(arg) {
	if (!arg) return undefined
	if (arg.type === 's') return arg.value
	if (arg.type === 'b') return arg.value.toString('utf8')
	return undefined
}

/** Best text from a feedback message: prefers the UTF-8 blob when both forms are sent. */
function messageText(args) {
	const blob = args.find((a) => a.type === 'b')
	return argText(blob ?? args[0])
}

/** A text argument: plain string when ASCII, UTF-8 blob otherwise. */
function textArg(str) {
	return /^[\x00-\x7f]*$/.test(str) ? { type: 's', value: str } : { type: 'b', value: Buffer.from(str, 'utf8') }
}

module.exports = { encodeMessage, decodePacket, argText, messageText, textArg }
