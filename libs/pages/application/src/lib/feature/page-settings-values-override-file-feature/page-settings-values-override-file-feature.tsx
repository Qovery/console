// import { useState } from 'react'
// import { Controller } from 'react-hook-form'
// import { useParams } from 'react-router-dom'
// import { useHelmDefaultValues } from '@qovery/domains/service-helm/feature'
// import { type Helm } from '@qovery/domains/services/data-access'
// import { useService } from '@qovery/domains/services/feature'
// import { PREVIEW_CODE } from '@qovery/shared/routes'
// import { Button, Heading, Icon, IconAwesomeEnum, Popover, Section } from '@qovery/shared/ui'

export function PageSettingsValuesOverrideFileFeature() {
  // const { environmentId = '', applicationId = '' } = useParams()
  // const { data: service } = useService({ serviceId: applicationId })
  // const [enabledHelmDefaultValues, setEnabledHelmDefaultValues] = useState(false)

  // const { refetch: refetchHelmDefaultValues, isFetching: isLoadingHelmDefaultValues } = useHelmDefaultValues({
  //   environmentId,
  //   helmDefaultValuesRequest: {
  //     source: (service as Helm).source,
  //   },
  //   enabled: enabledHelmDefaultValues,
  // })

  // const createHelmDefaultValuesMutation = async () => {
  //   setEnabledHelmDefaultValues(true)
  //   const { data: helmDefaultValues } = await refetchHelmDefaultValues()
  //   if (helmDefaultValues) window.open(`${PREVIEW_CODE}?code=${encodeURIComponent(helmDefaultValues)}`, '_blank')
  // }

  return <div>test</div>
}

export default PageSettingsValuesOverrideFileFeature
