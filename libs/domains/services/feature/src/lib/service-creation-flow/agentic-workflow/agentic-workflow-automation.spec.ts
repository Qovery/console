import { createAgenticWorkflowAutomation, formatAgenticWorkflowAutomationOutputs } from './agentic-workflow-automation'

describe('agentic workflow automation adapters', () => {
  it('hydrates the implicit webhook, schedule, and complete output data', () => {
    expect(
      createAgenticWorkflowAutomation({ cron_expression: '0 8 * * 1-5', timezone: 'Europe/Paris', next_run_at: null }, [
        {
          name: 'Audit log',
          url: null,
          headers: [{ name: 'Authorization', value: 'Bearer {{TOKEN}}' }],
          instructions: 'Only send confirmed incidents.',
        },
      ])
    ).toEqual({
      id: 'automation',
      triggers: [
        { id: 'webhook', type: 'webhook' },
        {
          id: 'schedule',
          type: 'schedule',
          cronExpression: '0 8 * * 1-5',
          timezone: 'Europe/Paris',
        },
      ],
      outputs: [
        {
          name: 'Audit log',
          url: null,
          headersJson: '{\n  "Authorization": "Bearer {{TOKEN}}"\n}',
          prompt: 'Only send confirmed incidents.',
        },
      ],
    })
  })

  it('serializes legacy nullable outputs without losing metadata', () => {
    expect(
      formatAgenticWorkflowAutomationOutputs([
        {
          name: 'Audit log',
          url: null,
          headersJson: '{"Authorization":"Bearer {{TOKEN}}"}',
          prompt: 'Only send confirmed incidents.',
        },
      ])
    ).toEqual([
      {
        name: 'Audit log',
        url: null,
        headers: [{ name: 'Authorization', value: 'Bearer {{TOKEN}}' }],
        instructions: 'Only send confirmed incidents.',
      },
    ])
  })

  it('ignores malformed and invalid header values when serializing settings outputs', () => {
    expect(
      formatAgenticWorkflowAutomationOutputs([
        { name: 'Malformed', url: null, headersJson: '{invalid', prompt: '' },
        { name: 'Invalid values', url: null, headersJson: '{"valid":"value","invalid":42}', prompt: '' },
      ])
    ).toEqual([
      { name: 'Malformed', url: null },
      { name: 'Invalid values', url: null, headers: [{ name: 'valid', value: 'value' }] },
    ])
  })
})
