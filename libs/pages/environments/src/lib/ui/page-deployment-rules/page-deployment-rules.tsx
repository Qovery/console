import { Reorder } from 'framer-motion'
import { type Cluster, type ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section } from '@qovery/shared/ui'
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

  const handleReorder = (deploymentRules: ProjectDeploymentRule[]) => {
    setListRules(deploymentRules)
    updateDeploymentRulesOrder(deploymentRules)
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
        <div className="flex w-full flex-col justify-between">
          <Section className="max-w-content-with-navigation-left p-8">
            <div className="flex justify-between gap-2">
              <SettingsHeading
                title=" Deployment rules"
                description="Configure your default deployment rules. Drag & drop rules to prioritize them."
              />
              <Button size="md" onClick={() => navigate(linkNewRule)}>
                Add rule <Icon className="ml-2" iconName="circle-plus" iconStyle="regular" />
              </Button>
            </div>

            <div className={`w-[640px] rounded bg-neutral-100 ${listRules?.length === 0 ? 'hidden' : ''}`}>
              <div className="rounded-t border-l border-r border-t border-neutral-250">
                <h2 className="rounded-t border-b border-neutral-250 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400">
                  Configured rules
                </h2>
              </div>
              <Reorder.Group axis="y" values={listRules} onReorder={handleReorder}>
                {listRules.length > 1 ? (
                  listRules.map((rule, index) => (
                    <Reorder.Item key={rule.id} value={rule}>
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
                    </Reorder.Item>
                  ))
                ) : listRules[0] ? (
                  <DeploymentRuleItem
                    id={listRules[0].id}
                    name={listRules[0].name}
                    startTime={listRules[0].start_time}
                    stopTime={listRules[0].stop_time}
                    weekDays={listRules[0].weekdays}
                    isLast={true}
                    isLoading={isLoading}
                    removeDeploymentRule={deleteDeploymentRule}
                    noDragDrop
                  />
                ) : null}
              </Reorder.Group>
            </div>
          </Section>
        </div>
      )}
    </>
  )
}

export default PageDeploymentRules
