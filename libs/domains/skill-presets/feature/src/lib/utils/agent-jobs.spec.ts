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
})
