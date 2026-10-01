export const AGENTIC_WORKFLOW_MIN_CPU_MILLI = 1000
export const AGENTIC_WORKFLOW_MIN_RAM_MIB = 2048

export function areAgenticWorkflowResourcesValid(cpu: string, memory: string) {
  return Number(cpu) >= AGENTIC_WORKFLOW_MIN_CPU_MILLI && Number(memory) >= AGENTIC_WORKFLOW_MIN_RAM_MIB
}
