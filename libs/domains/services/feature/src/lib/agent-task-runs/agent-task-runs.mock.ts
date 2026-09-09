export type RunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface AgentTaskRun {
  deployment_id: string
  environment_id: string
  agent_task_id: string
  agent_task_name: string
  status: RunStatus
  trigger: 'MANUAL' | 'SCHEDULE' | 'WEBHOOK'
  created_at: string
  started_at: string | null
  finished_at: string | null
  duration_ms: number | null
  prompt: string | null
  result: string | null
  error: string | null
  logs_url: string | null
}

// Fixed timestamps keep the preview reproducible. These records never represent real services.
export const MOCK_RUNS: AgentTaskRun[] = (['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const).map(
  (status, index) => ({
    deployment_id: `a83f120${index}-a121-4000-8000-00000000000${index}`,
    environment_id: 'demo-environment',
    agent_task_id: index % 2 === 0 ? 'demo-incident-agent' : 'demo-deployment-agent',
    agent_task_name: index % 2 === 0 ? 'Incident Analyser' : 'Deployment review',
    status,
    trigger: index % 3 === 0 ? 'WEBHOOK' : index % 3 === 1 ? 'MANUAL' : 'SCHEDULE',
    created_at: `2026-09-09T09:${50 - index * 10}:00Z`,
    started_at: status === 'QUEUED' ? null : `2026-09-09T09:${50 - index * 10}:02Z`,
    finished_at: status === 'QUEUED' || status === 'RUNNING' ? null : `2026-09-09T09:${50 - index * 10}:36Z`,
    duration_ms: status === 'QUEUED' ? null : status === 'RUNNING' ? 120000 : 34000,
    prompt:
      'Review the latest deployment and investigate any errors. Summarize the findings and suggest the next action. Do not modify infrastructure.',
    result:
      status === 'COMPLETED'
        ? 'Deployment completed successfully. No new errors were detected. All health checks passed. No action is required.'
        : null,
    error:
      status === 'FAILED'
        ? 'The configured monitoring integration could not be reached. The execution stopped before analysis completed.'
        : null,
    logs_url: null,
  })
)
