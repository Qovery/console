import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SERVICES_JOB_CREATION_DOCKERFILE_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Checkbox, ExternalLink, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useJobContainerCreateContext } from '../page-job-create-feature'
import imageLifecycleIntroduction from './lifecycle-introduction.png'
import { setLocalStorageStepIntroduction } from './util-localstorage-step'

export function StepIntroductionFeature() {
  useDocumentTitle('Introduction - Create Job')

  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const { setCurrentStep, jobURL } = useJobContainerCreateContext()
  const navigate = useNavigate()

  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1280px]">
      <div className="flex items-center gap-16">
        <Section className="mt-10 flex max-w-[480px] flex-col gap-8">
          <Heading className="text-[32px]">Lifecycle Jobs</Heading>
          <div className="flex flex-col gap-4 text-neutral-350">
            <p>
              Lifecycle jobs allow to execute custom code based on the event triggered on the environment
              (start/stop/delete). This can be useful to manage external resources or trigger specific actions based on
              the environment events. More in details:
            </p>
            <ul className="list-decimal pl-4">
              <li>
                When a deployment on your environment is triggered, an image is built from your code source (deploying
                from a container registry is supported)
              </li>
              <li>
                Depending on the action triggered on your environment (start/stop/delete), a specific command can be
                execute at runtime. Example: on env start run “/bin/sh start.sh”
              </li>
              <li>
                Your code can generate an output file /qovery-output/qovery-output.json. The content of this file is
                automatically fetched by Qovery and stored as environment variables.
              </li>
              <li>Any other service within the same environment can then access these environment variables.</li>
            </ul>
          </div>
          <div className="flex flex-col items-center gap-5">
            <ExternalLink className="ml-4" href="https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/">
              Learn more
            </ExternalLink>
            <Button size="lg" onClick={onSubmit} className="w-full justify-center">
              Get started
            </Button>
            <div className="flex items-center">
              <Checkbox
                id="dont-show-again"
                className="mr-3 h-4 w-4"
                checked={dontShowAgain}
                onCheckedChange={(checked: boolean) => {
                  setDontShowAgain(checked)
                  setLocalStorageStepIntroduction(checked)
                }}
              />
              <label className="text-sm font-medium text-neutral-400" htmlFor="dont-show-again">
                Don’t show it again
              </label>
            </div>
          </div>
        </Section>
        <div>
          <img
            src={imageLifecycleIntroduction}
            alt="Lifecycle Jobs"
            className="pointer-events-none w-full select-none"
          />
        </div>
      </div>
    </FunnelFlowBody>
  )
}

export default StepIntroductionFeature
