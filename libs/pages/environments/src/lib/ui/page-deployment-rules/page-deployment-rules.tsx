import { type Cluster, type ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  type DraggableProvided,
  type DropResult,
  Droppable,
  type DroppableProvided,
} from 'react-beautiful-dnd'
import { useNavigate } from 'react-router-dom'
import { Button, Icon } from '@qovery/shared/ui'
import DeploymentRuleItem from '../deployment-rule-item/deployment-rule-item'
import PlaceholderNoRules from '../placeholder-no-rules/placeholder-no-rules'

export interface PageDeploymentRulesProps {
  organizationId: string
  clusters: Cluster[]
  deploymentRules: ProjectDeploymentRule[]
  updateDeploymentRulesOrder: (list: ProjectDeploymentRule[]) => void
  deleteDeploymentRule: (rule: string) => void
  linkNewRule?: string
  isLoading?: boolean
}

export function PageDeploymentRules({
  organizationId,
  clusters,
  deploymentRules,
  updateDeploymentRulesOrder,
  isLoading = false,
  deleteDeploymentRule,
  linkNewRule = '',
}: PageDeploymentRulesProps) {
  const navigate = useNavigate()
  const [listRules, setListRules] = useState<ProjectDeploymentRule[]>(deploymentRules || [])

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const currentList = [...listRules]
    const ruleToMove = currentList[source.index]
    currentList.splice(source.index, 1)
    currentList.splice(destination.index, 0, ruleToMove)

    setListRules(currentList)
    updateDeploymentRulesOrder(currentList)
  }

  useEffect(() => {
    if (!isLoading) setListRules(deploymentRules)
  }, [deploymentRules, isLoading])

  return (
    <>
      {isLoading && <div className="h-full" />}
      {listRules.length === 0 && !isLoading && (
        <PlaceholderNoRules
          organizationId={organizationId}
          clusterAvailable={clusters.length > 0}
          linkNewRule={linkNewRule}
        />
      )}
      {listRules.length >= 1 && !isLoading && (
        <div className="min-h-0 flex-grow overflow-y-auto px-10 py-7">
          <div className="mb-8 flex w-[640px] items-center justify-between">
            <p className="text-xs text-neutral-400">
              Configure your default deployment rules. Drag & drop rules to prioritize them.
            </p>
            <Button size="md" onClick={() => navigate(linkNewRule)}>
              Add rule <Icon className="ml-2" iconName="circle-plus" iconStyle="light" />
            </Button>
          </div>

          <div className={`w-[640px] rounded bg-neutral-100 ${listRules?.length === 0 ? 'hidden' : ''}`}>
            <div className="rounded-t border-l border-r border-t border-neutral-250">
              <h2 className="rounded-t border-b border-neutral-250 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400">
                Deployment Rules
              </h2>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rules-list">
                {(provided: DroppableProvided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {listRules?.map((rule: ProjectDeploymentRule, index) => (
                      <Draggable draggableId={index.toString()} key={index} index={index}>
                        {(providedDraggble: DraggableProvided) => (
                          <div
                            {...providedDraggble.draggableProps}
                            {...providedDraggble.dragHandleProps}
                            ref={providedDraggble.innerRef}
                          >
                            <DeploymentRuleItem
                              id={rule.id}
                              name={rule.name}
                              startTime={rule.start_time}
                              stopTime={rule.stop_time}
                              weekDays={rule.weekdays}
                              isLast={index === listRules.length - 1 ? true : false}
                              isLoading={isLoading}
                              removeDeploymentRule={deleteDeploymentRule}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}
    </>
  )
}

export default PageDeploymentRules
