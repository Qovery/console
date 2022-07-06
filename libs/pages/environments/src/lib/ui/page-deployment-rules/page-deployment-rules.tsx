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

  const LIST = [
    'An environment help you to amet minim mollit non deserunt.',
    'Ullamco est sit aliqua dolor do amet sint.',
  ]

  useEffect(() => {
    setListRules(deploymentRules)
  }, [deploymentRules])

  if (listRules.length === 0) {
    return (
      <div className="mt-2 bg-white rounded flex flex-col flex-grow">
        <div className="flex-grow overflow-y-auto flex">
          <div className="flex justify-center items-center flex-grow">
            <div className="flex flex-col items-center">
              <img
                className="w-12 pointer-events-none user-none mb-5"
                src="/assets/images/event-placeholder-light.svg"
                alt="Event placeholder"
              />
              <h2 className="text-base text-text-600 font-medium mb-1">
                Create your first Deployment Rules <span role="img">🕹</span>
              </h2>
              <p className="text-sm text-text-500 max-w-[420px] text-center mb-5">
                Events enable you to Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
              </p>
              <Button link={linkNewRule}>Create Deployment Rule</Button>
            </div>
          </div>
          <div className="w-right-help-sidebar border-l border-element-light-lighter-400">
            <div className="p-10 border-b border-element-light-lighter-400">
              <span className="flex justify-center items-center rounded bg-accent1-500 w-7 h-7 text-sm text-white">
                <Icon name="icon-solid-lightbulb" />
              </span>
              <h2 className="h5 text-text-700 mt-5 mb-5">What is an organization, what is a project?</h2>
              <ul className="text-sm ml-2">
                {LIST.map((l, index) => (
                  <li
                    className="text-text-500 mb-2 flex gap-3 before:content-[''] before:w-1 before:h-1 before:rounded-full before:shrink-0 before:mt-2 before:bg-text-500"
                    key={index}
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-10">
              <p className="text-sm text-text-500 mb-5">You may find these links useful</p>
              <a
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
                target="_blank"
                rel="noreferrer"
                className="link text-accent2-500 text-sm block mb-3"
              >
                How to configure an environment <Icon name="icon-solid-arrow-up-right-from-square" />
              </a>
              <a
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
                target="_blank"
                rel="noreferrer"
                className="link text-accent2-500 text-sm block"
              >
                Set parameters on my environment <Icon name="icon-solid-arrow-up-right-from-square" />
              </a>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-b">
          <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
        </div>
      </div>
    )
  } else {
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

          <div className={`w-[640px] bg-element-light-lighter-200 rounded ${listRules?.length === 0 ? 'hidden' : ''}`}>
            <div className="border-t border-l border-r rounded-t border-element-light-lighter-500">
              <h2 className="text-sm text-text-500 font-medium py-2 px-4 border-b border-element-light-lighter-500 bg-element-light-lighter-200 rounded-t">
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
}

export default PageDeploymentRules
