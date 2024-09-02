import { useContext } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { VariablesContext } from '../variables-context/variables-context'

export function ShowAllVariablesToggle({ className }: { className?: string }) {
  const { showAllVariablesValues, setShowAllVariablesValues } = useContext(VariablesContext)
  return (
    <Button
      variant="surface"
      className={twMerge('gap-2', className)}
      onClick={() => setShowAllVariablesValues(!showAllVariablesValues)}
      size="md"
    >
      {showAllVariablesValues ? 'Hide all values' : 'Show all values'}
      <Icon iconName={showAllVariablesValues ? 'eye-slash' : 'eye'} iconStyle="regular" />
    </Button>
  )
}
