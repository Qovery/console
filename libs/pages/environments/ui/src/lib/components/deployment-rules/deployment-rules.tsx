import { BaseLink, HelpSection } from '@console/shared/ui'
import DeploymentRuleItem from './deployment-rule-item/deployment-rule-item'
import {
  Draggable,
  DragDropContext,
  Droppable,
  DroppableProvidedProps,
  DroppableProvided,
  DraggableProvided,
} from 'react-beautiful-dnd'
import { useEffect, useState } from 'react'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'

export interface DeploymentRulesProps {
  listHelpfulLinks: BaseLink[]
  deploymentRules: ProjectDeploymentRule[]
  updateDeploymentRulesOrder: (list: ProjectDeploymentRule[]) => void
  deleteDeploymentRule: (rule: string) => void
  isLoading?: boolean
}

export function DeploymentRulesPage(props: DeploymentRulesProps) {
  const {
    listHelpfulLinks,
    deploymentRules,
    updateDeploymentRulesOrder,
    isLoading = false,
    deleteDeploymentRule,
  } = props
  const [listRules, setListRules] = useState<ProjectDeploymentRule[]>(deploymentRules)

  const onDragEnd = (result: any) => {
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
    setListRules(deploymentRules)
  }, [deploymentRules])

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <p className="mb-5 text-text-400 text-xs">
            Configure your default deployment rules. Drag & drop rules to prioritize them.
          </p>

          <div className={`max-w-2xl ${listRules?.length === 0 ? 'hidden' : ''}`}>
            <div className="border-t border-l border-r rounded-t border-element-light-lighter-400">
              <h2 className="text-sm text-text-500 font-medium py-2 px-4">Deployment Rules</h2>
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
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
    </div>
  )
}

export default DeploymentRulesPage
