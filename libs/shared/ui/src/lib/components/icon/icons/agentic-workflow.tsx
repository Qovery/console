import { type IconProps } from '../icon'
import agenticWorkflowIcon from './agentic-workflow.svg'

export function AgenticWorkflowIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <image href={agenticWorkflowIcon} width="24" height="24" />
    </svg>
  )
}

export default AgenticWorkflowIcon
