import { BaseLink, Button, ButtonSize, HelpSection, Icon } from '@console/shared/ui'
import DeploymentRuleItem from '../deployment-rule-item/deployment-rule-item'
import {
  Draggable,
  DragDropContext,
  Droppable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from 'react-beautiful-dnd'
import { useEffect, useState } from 'react'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'

export interface PageDeploymentRulesProps {
  listHelpfulLinks: BaseLink[]
  deploymentRules: ProjectDeploymentRule[]
  updateDeploymentRulesOrder: (list: ProjectDeploymentRule[]) => void
  deleteDeploymentRule: (rule: string) => void
  linkNewRule?: string
  isLoading?: boolean
}

export function PageDeploymentRules(props: PageDeploymentRulesProps) {
  const {
    listHelpfulLinks,
    deploymentRules,
    updateDeploymentRulesOrder,
    isLoading = false,
    deleteDeploymentRule,
    linkNewRule = '',
  } = props
  const [listRules, setListRules] = useState<ProjectDeploymentRule[]>(deploymentRules)

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
    setListRules(deploymentRules)
  }, [deploymentRules])

  return (
    <div className="mt-2 bg-white rounded flex flex-col flex-grow">
      <div className="py-7 px-10 flex-grow overflow-y-auto min-h-0">
        <div className="flex justify-between items-center mb-8 w-[640px]">
          <p className="text-text-500 text-xs">
            Configure your default deployment rules. Drag & drop rules to prioritize them.
          </p>

          <Button size={ButtonSize.SMALL} className="leading-none" link={linkNewRule}>
            Add rule
            <Icon name="icon-solid-plus" className="ml-2 !text-base inline-block -mt-1" />
          </Button>
        </div>

        <div className={`w-[640px] ${listRules?.length === 0 ? 'hidden' : ''}`}>
          <div className="border-t border-l border-r rounded-t border-element-light-lighter-500">
            <h2 className="text-sm text-text-500 font-medium py-2 px-4 bg-element-light-lighter-200">
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
      <div className="bg-white rounded-b">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
    </div>
  )
}

export default PageDeploymentRules
