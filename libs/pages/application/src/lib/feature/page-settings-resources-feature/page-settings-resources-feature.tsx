import equal from 'fast-deep-equal'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { convertMemory } from '@console/shared/utils'
import { RootState } from '@console/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export function PageSettingsResourcesFeature() {
  const { applicationId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  // const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    equal
  )

  const methods = useForm({
    defaultValues: {
      memory: application?.memory,
      memory_size: 'MB',
    },
    mode: 'onChange',
  })

  const watchMemory = methods.watch('memory')
  const watchMemoryUnit: string = methods.watch('memory_size')

  useEffect(() => {
    if (application) {
      methods.setValue('memory', application?.memory)
    }
  }, [application, methods])

  useEffect(() => {
    if (watchMemoryUnit === 'GB') {
      console.log(convertMemory(watchMemory, 'GB'))
      methods.setValue('memory', convertMemory(watchMemory, 'GB'))
    } else {
      methods.setValue('memory', watchMemory)
    }
  }, [methods, watchMemoryUnit])

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)
    // memory (size) MB by default
    console.log(data)
    console.log(application)
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsResources onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
