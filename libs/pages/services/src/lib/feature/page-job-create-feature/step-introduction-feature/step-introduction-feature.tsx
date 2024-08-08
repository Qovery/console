import { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { SERVICES_JOB_CREATION_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Checkbox, ExternalLink, FunnelFlowBody, Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useJobContainerCreateContext } from '../page-job-create-feature'
import imageBuild from './images/build.svg'
import imageOutput from './images/output.svg'
import imageRun from './images/run.svg'
import imageTrigger from './images/trigger.svg'
import { setLocalStorageStepIntroduction } from './util-localstorage-step'

interface CardProps extends PropsWithChildren {
  title: string
  content: ReactNode
  className?: string
}

function Card({ title, content, className, children }: CardProps) {
  return (
    <div
      className={twMerge(
        'overflow-hidden rounded-[16px] shadow-md transition hover:-translate-y-1.5 hover:shadow-lg',
        className
      )}
    >
      <div className="w-full bg-gradient-to-r from-[#B160F0] via-[#7366FF] to-[#B160F0] bg-[length:200%_auto] p-0.5 motion-safe:animate-[backgroundLinear_2s_linear_infinite] sm:max-w-[196px]">
        <div className="flex h-full w-full flex-col gap-2 rounded-[14px] bg-white">
          <h1 className="flex p-3 pb-0 text-[28px] text-brand-500">
            {title}
            <Tooltip classNameContent="max-w-[196px]" classNameTrigger="ml-2 relative -top-[2px]" content={content}>
              <span>
                <Icon iconName="info-circle" iconStyle="regular" className="mr-4 text-lg" />
              </span>
            </Tooltip>
          </h1>
          <div className="p-1.5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function StepIntroductionFeature() {
  useDocumentTitle('Introduction - Create Job')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { setCurrentStep, jobURL, templateType } = useJobContainerCreateContext()
  const navigate = useNavigate()

  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[924px]">
      <div className="mx-auto flex flex-col items-center justify-center gap-16">
        <Section className="flex flex-col gap-10">
          <div className="motion-safe:animate-[fadein_0.3s_ease-in-out]">
            <Heading className="mb-4 text-[32px]">
              {match(templateType)
                .with(
                  'CLOUDFORMATION',
                  'TERRAFORM',
                  (templateType) => `Deploying ${upperCaseFirstLetter(templateType)} manifest`
                )
                .with('GENERIC', undefined, () => 'Lifecycle Jobs')
                .exhaustive()}
            </Heading>
            <p className="text-neutral-350">
              {match(templateType)
                .with(
                  'CLOUDFORMATION',
                  (templateType) =>
                    `Qovery packages your ${upperCaseFirstLetter(templateType)} template, inputs and Cloudformation CLI as a containerized application and executes it on your Kubernetes cluster as job (Qovery Lifecycle job). A different command is executed depending on the event triggered (deploy/stop/delete), allowing you to synchronously manage the lifecycle of any external resource (create/pause/destroy).`
                )
                .with(
                  'TERRAFORM',
                  (templateType) =>
                    `Qovery packages your ${upperCaseFirstLetter(templateType)} manifest, inputs and Terraform CLI as a containerized application and executes it on your Kubernetes cluster as job (Qovery Lifecycle job). A different command is executed depending on the event triggered (deploy/stop/delete), allowing you to synchronously manage the lifecycle of any external resource (create/pause/destroy).`
                )
                .with(
                  'GENERIC',
                  undefined,
                  () =>
                    'A Lifecycle job allows to execute custom code based on the event triggered on the environment (start/stop/delete). This can be useful to manage the lifecycle of an external resource (create/destroy) or execute a script based on a specific event.'
                )
                .exhaustive()}
            </p>
          </div>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-1">
            <Card
              title="Build"
              className=" motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_100ms] motion-safe:opacity-0"
              content={match(templateType)
                .returnType<ReactNode>()
                .with('CLOUDFORMATION', () => (
                  <ul className="list-outside list-disc pl-2">
                    <li>
                      Your template and inputs are packaged within a container image via a Dockerfile, defining the
                      runtime environment: Cloudformation CLI version and commands to run during the execution (e.g: if
                      container launched with command “start”, run "cloudformation deploy + ”).
                    </li>
                    <li>
                      Qovery provides you with a pre-configured Dockerfile that you can customize to match your needs.
                    </li>
                  </ul>
                ))
                .with('TERRAFORM', () => (
                  <ul className="list-outside list-disc pl-2">
                    <li>
                      Your manifest and inputs are packaged within a container image via a Dockerfile, defining the
                      runtime environment: Terraform CLI version and commands to run during the execution (e.g: if
                      container launched with command “start”, run “terraform apply + output”).
                    </li>
                    <li>
                      Qovery provides you with a pre-configured Dockerfile that you can customize to match your needs.
                    </li>
                  </ul>
                ))
                .with(
                  'GENERIC',
                  undefined,
                  () =>
                    'When a deployment on your environment is triggered, an image is built from your code source (deploying from a container registry is supported as well).'
                )
                .exhaustive()}
            >
              <img src={imageBuild} alt="Build - Lifecycle job" className="pointer-events-none w-full select-none" />
            </Card>
            <Icon
              iconName="angles-right"
              className="mt-8 hidden text-brand-500  motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_150ms] motion-safe:opacity-0 md:block"
            />
            <Card
              title="Trigger"
              content="Depending on the event triggered on your environment (deploy/stop/delete), a command defined within your Dockerfile will be executed to create/destroy the resource. Example: on event “deploy” execute the command “start.sh”"
              className=" motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_150ms] motion-safe:opacity-0"
            >
              <img
                src={imageTrigger}
                alt="Trigger - Lifecycle job"
                className="pointer-events-none w-full select-none"
              />
            </Card>
            <Icon
              iconName="angles-right"
              className="mt-8 hidden text-brand-500  motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_250ms] motion-safe:opacity-0 md:block"
            />
            <Card
              title="Run"
              content={match(templateType)
                .returnType<ReactNode>()
                .with(
                  'CLOUDFORMATION',
                  'TERRAFORM',
                  () =>
                    'The container is executed as a Kubernetes Job on your cluster and it runs the command chosen from the previous step. At this step it will create/destroy the resource (DB, queues ..).'
                )
                .with(
                  'GENERIC',
                  undefined,
                  () =>
                    'Your code is executed as a Kubernetes Job on your cluster and it runs the command chosen from the previous step. At this step it can create external resources (DB, queues ..) or interact with some existing system (seed db..).'
                )
                .exhaustive()}
              className=" motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_250ms] motion-safe:opacity-0"
            >
              <img src={imageRun} alt="Run - Lifecycle job" className="pointer-events-none w-full select-none" />
            </Card>
            <Icon
              iconName="angles-right"
              className="mt-8 hidden text-brand-500  motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_350ms] motion-safe:opacity-0 md:block"
            />
            <Card
              title="Output"
              content={match(templateType)
                .returnType<ReactNode>()
                .with(
                  'CLOUDFORMATION',
                  () =>
                    'The output of the Cloudformation describe-stack command is automatically retrieved and injected as environment variable on any application within the same environment, allowing them to access the resource created during the Terraform execution.'
                )
                .with(
                  'TERRAFORM',
                  () =>
                    'The output of the Terraform apply command is automatically retrieved and injected as environment variable on any application within the same environment, allowing them to access the resource created during the Terraform execution.'
                )
                .with(
                  'GENERIC',
                  undefined,
                  () =>
                    '(Optional) The job can generate an “output file”, containing the references of the external resources created during its execution (format and path to be respected). Qovery automatically  injects its content as environment variable on any application within the same environment, allowing them to access the resource.'
                )
                .exhaustive()}
              className=" motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_350ms] motion-safe:opacity-0"
            >
              <img src={imageOutput} alt="Output - Lifecycle job" className="pointer-events-none w-full select-none" />
            </Card>
          </div>
          <div className="mx-auto flex w-full flex-col items-center gap-5  motion-safe:animate-[fadein_0.3s_ease-in-out_forwards_350ms] motion-safe:opacity-0 md:w-[480px]">
            <div className="flex w-full justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="dont-show-again"
                  className="mr-3"
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
              <ExternalLink
                className="ml-4"
                href="https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/"
              >
                Learn more
              </ExternalLink>
            </div>
            <Button size="lg" onClick={onSubmit} className="w-full justify-center">
              Get started
            </Button>
          </div>
        </Section>
      </div>
    </FunnelFlowBody>
  )
}

export default StepIntroductionFeature
