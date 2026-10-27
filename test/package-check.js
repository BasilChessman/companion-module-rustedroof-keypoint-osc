// Unpacks the built .tgz and loads it the way Companion does, then constructs the
// instance with the real (bundled) SDK and runs init/destroy. Run after `npm run package`.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createFakeContext, loadLikeCompanion } from './fake-context.js'

const tgz = readdirSync('.').find((f) => f.endsWith('.tgz'))
if (!tgz) throw new Error('No .tgz found; run npm run package first')
const dir = mkdtempSync(path.join(tmpdir(), 'kp-pkg-'))
execFileSync('tar', ['-xzf', tgz, '-C', dir])
const root = path.join(dir, readdirSync(dir)[0])
const manifest = JSON.parse(readFileSync(path.join(root, 'companion/manifest.json'), 'utf8'))
const entry = path.resolve(root, 'companion', manifest.runtime.entrypoint)

const { ctor, upgradeScripts } = await loadLikeCompanion(pathToFileURL(entry).href)
const { context, record } = createFakeContext()
const instance = new ctor(context)
await instance.init({ host: '127.0.0.1', port: 35551 }, true, undefined)
const counts = {
	actions: Object.keys(record.actions ?? {}).length,
	feedbacks: Object.keys(record.feedbacks ?? {}).length,
	variables: Object.keys(record.variableDefinitions ?? {}).length,
	presets: Object.keys(record.presets ?? {}).length,
}
await instance.destroy()
for (const [k, n] of Object.entries(counts)) if (n === 0) throw new Error(`Package registered no ${k}`)
console.log(`Package OK: ${tgz} (${manifest.id} ${manifest.version}, API ${manifest.runtime.apiVersion}, ${manifest.runtime.type}),`,
	`${upgradeScripts.length} upgrade scripts,`, Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', '))
