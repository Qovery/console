import { type ProjectDeploymentRule } from 'qovery-typescript-axios'
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
  deploymentRules: ProjectDeploymentRule[]
  updateDeploymentRulesOrder: (list: ProjectDeploymentRule[]) => void
  deleteDeploymentRule: (rule: string) => void
  linkNewRule?: string
  isLoading?: boolean
}

export function PageDeploymentRules({
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
    <div className="mt-2 bg-white rounded flex flex-col flex-grow">
      {isLoading && <div className="h-full" />}
      {listRules.length === 0 && !isLoading && <PlaceholderNoRules linkNewRule={linkNewRule} />}
      {listRules.length >= 1 && !isLoading && (
        <div className="py-7 px-10 flex-grow overflow-y-auto min-h-0">
          <div className="flex justify-between items-center mb-8 w-[640px]">
            <p className="text-neutral-400 text-xs">
              Configure your default deployment rules. Drag & drop rules to prioritize them.
            </p>
            <Button size="lg" onClick={() => navigate(linkNewRule)}>
              Add rule <Icon className="ml-2" iconName="circle-plus" />
            </Button>
          </div>

          <div className={`w-[640px] bg-neutral-100 rounded ${listRules?.length === 0 ? 'hidden' : ''}`}>
            <div className="border-t border-l border-r rounded-t border-neutral-250">
              <h2 className="text-sm text-neutral-400 font-medium py-2 px-4 border-b border-neutral-250 bg-neutral-100 rounded-t">
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
    </div>
  )
}

export default PageDeploymentRules
