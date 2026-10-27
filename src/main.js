import dgram from 'node:dgram'
import { InstanceBase, InstanceStatus, Regex } from '@companion-module/base'
import { encodeMessage, decodePacket } from './osc.js'
import { KeyPointState } from './state.js'
import { PREFIX } from './commands.js'
import { UpgradeScripts } from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'
import UpdatePresets from './presets.js'

// Companion (module API 2.x) imports this file and uses the default export as the
// instance class and the named UpgradeScripts export.
export { UpgradeScripts }

const PING_INTERVAL_MS = 3000
// No reply for this long means KeyPoint is unreachable (or not running).
const TIMEOUT_MS = 8000

export default class KeyPointInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.state = new KeyPointState()
		this.socket = null
		this.pingTimer = null
		this.lastReply = 0
		this.connected = false
	}

	async init(config) {
		this.config = config
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
		this.setVariableValues({ ...this.state.values, connected: false })
		this.start()
	}

	async destroy() {
		this.stop()
	}

	async configUpdated(config) {
		this.config = config
		this.stop()
		this.state.reset()
		this.setVariableValues({ ...this.state.values, connected: false })
		this.checkAllFeedbacks()
		this.start()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'KeyPoint OSC',
				value:
					'Controls PowerPoint for Mac and Keynote through the KeyPoint OSC menu-bar app (version 0.1 or later). ' +
					'KeyPoint answers this connection directly, so no feedback settings are needed in the KeyPoint menu.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Mac IP address',
				width: 8,
				regex: Regex.HOSTNAME,
				tooltip: 'Shown in the KeyPoint menu as "This Mac"',
			},
			{
				type: 'number',
				id: 'port',
				label: 'KeyPoint listen port',
				width: 4,
				default: 35551,
				min: 1024,
				max: 65535,
			},
		]
	}

	// MARK: Networking

	start() {
		const host = (this.config.host || '').trim()
		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Enter the Mac IP address')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		const socket = dgram.createSocket({ type: 'udp4' })
		this.socket = socket
		socket.on('error', (err) => {
			this.log('error', `UDP: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})
		socket.on('message', (buf, rinfo) => this.receive(buf, rinfo))
		socket.on('listening', () => {
			// KeyPoint replies to /keypoint controllers at the address and port they send
			// from, so one socket on any free port both sends and receives.
			this.sendRaw(`${PREFIX}/ping`)
			this.sendRaw(`${PREFIX}/feedbacks/refresh`)
			this.pingTimer = setInterval(() => this.tick(), PING_INTERVAL_MS)
		})
		socket.bind(0)
	}

	stop() {
		if (this.pingTimer) clearInterval(this.pingTimer)
		this.pingTimer = null
		if (this.socket) {
			try {
				this.socket.close()
			} catch {
				// already closed
			}
		}
		this.socket = null
		this.connected = false
	}

	get targetPort() {
		return Number(this.config.port) || 35551
	}

	tick() {
		this.sendRaw(`${PREFIX}/ping`)
		if (this.connected && Date.now() - this.lastReply > TIMEOUT_MS) {
			this.connected = false
			this.updateStatus(InstanceStatus.ConnectionFailure, `No reply from KeyPoint OSC at ${this.config.host}:${this.targetPort}`)
			this.setVariableValues({ connected: false })
			this.checkFeedbacks('connected')
		} else if (!this.connected && this.lastReply === 0) {
			this.updateStatus(InstanceStatus.Connecting, `Waiting for KeyPoint OSC at ${this.config.host}:${this.targetPort}`)
		}
	}

	/** Sends one OSC message ({ address, args }) to KeyPoint. */
	send(message) {
		this.sendRaw(message.address, message.args)
	}

	sendRaw(address, args = []) {
		if (!this.socket) return
		try {
			const data = encodeMessage(address, args)
			this.socket.send(data, this.targetPort, this.config.host.trim(), (err) => {
				if (err) this.log('warn', `Send ${address} failed: ${err.message}`)
			})
		} catch (err) {
			this.log('warn', `Send ${address} failed: ${err.message}`)
		}
	}

	receive(buf, rinfo) {
		let messages
		try {
			messages = decodePacket(buf)
		} catch (err) {
			this.log('debug', `Ignored packet from ${rinfo.address}: ${err.message}`)
			return
		}
		const changed = new Set()
		let capsChanged = false
		for (const { address, args } of messages) {
			const result = this.state.apply(address, args)
			if (result === null) continue // not KeyPoint feedback (e.g. OSCPoint format)
			for (const key of result) {
				if (key === 'capabilities') capsChanged = true
				else changed.add(key)
			}
		}
		this.lastReply = Date.now()
		if (!this.connected) {
			this.connected = true
			this.updateStatus(InstanceStatus.Ok)
			changed.add('connected')
		}
		if (changed.size > 0) {
			const values = { connected: this.connected }
			for (const key of changed) if (key !== 'connected') values[key] = this.state.values[key]
			this.setVariableValues(values)
		}
		if (changed.size > 0 || capsChanged) this.checkAllFeedbacks()
	}

	// MARK: Definitions

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}
}

