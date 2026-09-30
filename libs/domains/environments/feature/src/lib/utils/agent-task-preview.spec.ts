import { isAgentTaskPreview, isAgentTaskPreviewOf } from './agent-task-preview'

const name = 'Production - agentic-workflow-run-9ec8d862-6970-4f99-bc36-0e398203968e'
it('recognizes the backend-generated agent preview name', () => {
  expect(isAgentTaskPreview({ name, mode: 'PREVIEW' })).toBe(true)
})
it.each([
  { name: 'Production - pull-request-123', mode: 'PREVIEW' as const },
  { name, mode: 'PRODUCTION' as const },
  { name: 'Production - agentic-workflow-run-invalid', mode: 'PREVIEW' as const },
])('preserves unrelated environments: $name / $mode', (environment) => {
  expect(isAgentTaskPreview(environment)).toBe(false)
})
it('only associates previews with the exact source environment name', () => {
  expect(isAgentTaskPreviewOf({ name, mode: 'PREVIEW' }, 'Production')).toBe(true)
  expect(isAgentTaskPreviewOf({ name, mode: 'PREVIEW' }, 'Prod')).toBe(false)
  expect(isAgentTaskPreviewOf({ name, mode: 'PREVIEW' }, 'Other')).toBe(false)
})
