/* eslint-disable-next-line */
import { useEffect } from 'react'
import { useDocumentTitle } from '@qovery/shared/utils'
import { useDatabaseCreateContext } from '../page-database-create-feature'

export function PageDatabaseCreateResourcesFeature() {
  useDocumentTitle('Resources - Create Database')
  const { generalData, setCurrentStep } = useDatabaseCreateContext()

  console.log(generalData)

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  return (
    <div>
      <h1>Welcome to PageDatabaseCreateResourcesFeature!</h1>
    </div>
  )
}

export default PageDatabaseCreateResourcesFeature
