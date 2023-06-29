import { ServicePort } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { FlowPortData, PortData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import PortRow from '../port-row/port-row'

export interface FlowCreatePortProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onAddPort: () => void
  onRemovePort: (port: number | ServicePort) => void
  ports?: PortData[] | ServicePort[]
  onBack?: () => void
  isSetting?: boolean
}

export function FlowCreatePort({ ports, onSubmit, onAddPort, onRemovePort, isSetting, onBack }: FlowCreatePortProps) {
  const { formState } = useFormContext<FlowPortData>()

  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Set port</h3>
          <Button size={ButtonSize.TINY} className="btn--no-min-w" onClick={onAddPort}>
            Add port
          </Button>
        </div>

        <p className="text-xs text-text-500">
          Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
          the same environment. You can also expose them on the internet by making them public. Declared ports are also
          used to check the liveness/readiness of your application
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          {ports?.map((port, index) => (
            <PortRow onDelete={onRemovePort} key={index} index={index} />
          ))}
        </div>

        {isSetting && (
          <div className="flex justify-between">
            <Button
              onClick={onBack}
              className="btn--no-min-w"
              type="button"
              size={ButtonSize.XLARGE}
              style={ButtonStyle.STROKED}
            >
              Back
            </Button>
            <Button
              dataTestId="button-submit"
              type="submit"
              disabled={!formState.isValid}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.BASIC}
            >
              Continue
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

export default FlowCreatePort
