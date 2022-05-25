import { BaseLink, HelpSection } from '@console/shared/ui'
import DeploymentRuleItem from './deployment-rule-item/deployment-rule-item'
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useState } from 'react'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'

export interface DeploymentRulesProps {
  listHelpfulLinks: BaseLink[]
  deploymentRules: ProjectDeploymentRule[]
}

export function DeploymentRulesPage(props: DeploymentRulesProps) {
  const { listHelpfulLinks, deploymentRules } = props
  const [listRules, setListRules] = useState<ProjectDeploymentRule[]>([])

  const onDragEnd = () => {
    setListRules(deploymentRules)
  }

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <p className="mb-5 text-text-400 text-xs">
            Configure your default deployment rules. Drag & drop rules to prioritize them.{' '}
          </p>

          <div className={`max-w-2xl ${!listRules.length ? 'hidden' : ''}`}>
            <div className="border-t border-l border-r rounded-t border-element-light-lighter-400">
              <h2 className="text-sm text-text-500 font-medium py-2 px-4">Deployment Rules</h2>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rules-list">
                {(provided: any) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {listRules.map((rule: ProjectDeploymentRule, index) => (
                      <Draggable draggableId={index.toString()} index={index}>
                        {(providedDraggble: any) => (
                          <div
                            {...providedDraggble.draggableProps}
                            {...providedDraggble.dragHandleProps}
                            ref={providedDraggble.innerRef}
                          >
                            <DeploymentRuleItem
                              name={rule.name}
                              startTime={rule.start_time}
                              stopTime={rule.stop_time}
                              weekDays={rule.weekdays}
                              isLast={index === listRules.length - 1 ? true : false}
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
