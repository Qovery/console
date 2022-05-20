import { BaseLink, HelpSection } from '@console/shared/ui'
import DeploymentRuleItem from './deployment-rule-item/deployment-rule-item'
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useState } from 'react'

export interface DeploymentRulesProps {
  listHelpfulLinks: BaseLink[]
}

export function DeploymentRulesPage(props: DeploymentRulesProps) {
  const { listHelpfulLinks } = props
  const [listRules, setListRules] = useState([])

  const onDragEnd = () => {
    setListRules([])
  }

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <p className="mb-5 text-text-400 text-xs">
            Configure your default deployment rules. Drag & drop rules to prioritize them.{' '}
          </p>

          <div className="max-w-2xl">
            <div className="border-t border-l border-r rounded-t border-element-light-lighter-400">
              <h2 className="text-sm text-text-500 font-medium py-2 px-4">Deployment Rules</h2>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rules-list">
                {(provided: any) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Draggable draggableId="1" index={1}>
                      {(providedDraggble: any) => (
                        <div
                          {...providedDraggble.draggableProps}
                          {...providedDraggble.dragHandleProps}
                          ref={providedDraggble.innerRef}
                        >
                          <DeploymentRuleItem
                            name="Test 1"
                            startTime="1970-01-01T08:00:00.000Z"
                            stopTime="1970-01-01T19:00:00.000Z"
                            weekDays={['MONDAY', 'TUESDAY']}
                            isLast={false}
                          />
                        </div>
                      )}
                    </Draggable>
                    <Draggable draggableId="2" index={2}>
                      {(providedDraggble: any) => (
                        <div
                          {...providedDraggble.draggableProps}
                          {...providedDraggble.dragHandleProps}
                          ref={providedDraggble.innerRef}
                        >
                          <DeploymentRuleItem
                            name="Test 2"
                            startTime="1970-01-01T08:00:00.000Z"
                            stopTime="1970-01-01T19:00:00.000Z"
                            weekDays={['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']}
                            isLast={false}
                          />
                        </div>
                      )}
                    </Draggable>
                    <Draggable draggableId="3" index={3}>
                      {(providedDraggble: any) => (
                        <div
                          {...providedDraggble.draggableProps}
                          {...providedDraggble.dragHandleProps}
                          ref={providedDraggble.innerRef}
                        >
                          <DeploymentRuleItem
                            name="Test 3"
                            startTime="1970-01-01T08:00:00.000Z"
                            stopTime="1970-01-01T19:00:00.000Z"
                            weekDays={['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']}
                            isLast={true}
                          />
                        </div>
                      )}
                    </Draggable>
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
