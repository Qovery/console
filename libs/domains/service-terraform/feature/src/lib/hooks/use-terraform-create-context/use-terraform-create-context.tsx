import { createContext, useContext } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { type TerraformGeneralData } from '@qovery/domains/service-settings/feature'

interface TerraformCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<TerraformGeneralData>
  creationFlowUrl?: string
}

export const TerraformCreateContext = createContext<TerraformCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useTerraformCreateContext = () => {
  const terraformCreateContext = useContext(TerraformCreateContext)
  if (!terraformCreateContext) throw new Error('useTerraformCreateContext must be used within a TerraformCreateContext')
  return terraformCreateContext
}
