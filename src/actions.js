const { COMMANDS } = require('./commands')

module.exports = function (self) {
	const definitions = {}
	for (const [id, command] of Object.entries(COMMANDS)) {
		definitions[id] = {
			name: command.name,
			description: command.description,
			options: command.options,
			callback: async (event) => {
				const message = command.build(event.options)
				if (message) {
					self.send(message)
				} else {
					self.log('warn', `${command.name}: missing a value, nothing sent`)
				}
			},
		}
	}
	self.setActionDefinitions(definitions)
}
