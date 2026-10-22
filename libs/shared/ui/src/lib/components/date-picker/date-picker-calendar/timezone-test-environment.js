// Jest sandboxes process.env inside specs, so a spec cannot change the timezone itself. This environment sets
// the worker's TZ for the spec that opts in via `@jest-environment-options {"timezone": "..."}`, then restores it.
const { TestEnvironment } = require('jest-environment-jsdom')

class TimezoneTestEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    this.previousTimezone = process.env.TZ
    process.env.TZ = config.projectConfig.testEnvironmentOptions.timezone
  }

  async teardown() {
    if (this.previousTimezone === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = this.previousTimezone
    }
    await super.teardown()
  }
}

module.exports = TimezoneTestEnvironment
