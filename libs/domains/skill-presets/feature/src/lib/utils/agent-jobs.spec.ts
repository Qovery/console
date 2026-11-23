import { AGENT_JOBS } from './agent-jobs'

const job = (slug: string) => {
  const found = AGENT_JOBS.find((item) => item.slug === slug)
  if (!found) throw new Error(`No job ${slug}`)
  return found
}

describe('AGENT_JOBS', () => {
  it.each(['patch-security-issue', 'test-on-production-clone'])(
    'keeps the environment variables of the production copy out of reach in %s',
    (slug) => {
      const sandboxRule = job(slug).policy.split('manage_sandbox if {')[1].split('}')[0]
      expect(sandboxRule).toContain('not "environmentVariable" in input.request.path')
    }
  )

  it('says the preview job may act on any environment its policy does not protect', () => {
    const preview = job('fix-in-preview-environment')
    expect(preview.policy).toContain('not input.qovery_metadata.environment_id in protected_environment_ids')
    expect(preview.can.join(' ')).toMatch(/any environment of the project except production and staging/)
    expect(preview.summary).toMatch(/any environment except production and staging/)
  })

  it('runs the idle job every day, as its prompt stops environments on weekends too', () => {
    expect(job('stop-idle-environments').trigger).toMatchObject({ cron: '0 8,20 * * *', timezone: 'Europe/Paris' })
  })

  it('scales before the Tuesday peak its prompt names, with the scale back as a second schedule', () => {
    const { trigger, prompt } = job('scale-before-traffic-peak')
    expect(prompt).toMatch(/On Tuesday at 9:30 AM/)
    expect(trigger).toMatchObject({ cron: '30 9 * * 2', timezone: 'Europe/Paris' })
    expect(trigger.note).toMatch(/0 14 \* \* 2/)
  })

  it('names the timezone of every schedule whose prompt is in Paris time', () => {
    AGENT_JOBS.filter(({ prompt, trigger }) => trigger.kind === 'schedule' && /Paris/.test(prompt)).forEach(
      ({ trigger }) => expect(trigger.timezone).toBe('Europe/Paris')
    )
  })
})
