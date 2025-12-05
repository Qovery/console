import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type CSSProperties } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'

export type Message = {
  id: string
  text: string
  owner: 'user' | 'assistant'
  timestamp: number
  vote?: 'upvote' | 'downvote'
}

export type Thread = Message[]

export interface DevopsCopilotPanelProps {
  onClose: () => void
  smaller?: boolean
  style?: CSSProperties
}

export type PlanStep = {
  messageId: string
  description: string
  toolName: string
  status: 'not_started' | 'in_progress' | 'completed' | 'waiting' | 'error'
}

export type DevopsCopilotContext = {
  organization?: Organization
  cluster?: Cluster
  project?: Project
  environment?: Environment
  service?: AnyService
  deployment?:
    | {
        execution_id?: string
      }
    | undefined
  readOnly?: boolean
}
