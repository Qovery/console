import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_DOCKERFILE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { parseCmd } from '@qovery/shared/util-js'
import StepGeneral from '../../../ui/page-job-create/step-general/step-general'
import { findTemplateData, useJobContainerCreateContext } from '../page-job-create-feature'

export function StepIntroductionFeature() {
  useDocumentTitle('Introduction - Create Job')

  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const { setCurrentStep, jobURL } = useJobContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const onSubmit = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
  }

  return (
    <FunnelFlowBody>
      <div className="flex">
        <Section>
          <Heading>Lifecycle Jobs</Heading>
          <p>
            Lifecycle jobs allow to execute custom code based on the event triggered on the environment
            (start/stop/delete). This can be useful to manage external resources or trigger specific actions based on
            the environment events. More in details:
          </p>
          <ul>
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
        </Section>
      </div>
    </FunnelFlowBody>
  )
}

export default StepIntroductionFeature
