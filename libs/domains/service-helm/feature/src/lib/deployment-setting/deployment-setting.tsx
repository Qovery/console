import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputText, InputToggle } from '@qovery/shared/ui'
import { joinArgsWithQuotes, parseCmd } from '@qovery/shared/util-js'

export const displayParsedCmd = (cmd: string) => {
  const parsedArgs = parseCmd(cmd)
  return joinArgsWithQuotes(parsedArgs)
}

export function DeploymentSetting() {
  const { control, watch } = useFormContext()
  const watchChartName = watch('chart_name')
  const watchVersion = watch('chart_version')
  const watchCmdArguments = watch('arguments')

  const watchBranch = watch('branch')
  const watchRootPath = watch('root_path')

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Controller
          name="arguments"
          control={control}
          defaultValue="--wait --atomic --debug"
          rules={{
            required: 'Please enter an command.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              label="Helm arguments"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <p className="ml-3 mt-1 text-xs text-neutral-350">
          Specify the helm arguments to be used during the helm install/upgrade. Expected format: -h 0.0.0.0
          <br />
          <ExternalLink size="xs" href="https://helm.sh/docs/helm/helm_install/" className="mt-0.5">
            See documentation
          </ExternalLink>
        </p>
      </div>
      {((watchCmdArguments && watchChartName && watchVersion) || watchBranch) && (
        <div className="flex flex-col gap-1 rounded border border-neutral-200 bg-neutral-150 px-3 py-2 text-neutral-350">
          <span className="select-none text-xs">Helm install format:</span>
          {!watchBranch ? (
            <span className="break-words text-sm">
              {`helm upgrade --install -n {{KUBERNETES_NAMESPACE}} {{RELEASE_NAME}} . ${displayParsedCmd(watchCmdArguments ?? '')}`}
            </span>
          ) : watchChartName ? (
            <span className="break-words text-sm">
              {`helm install ${watchChartName} {{RELEASE_NAME}} ${watchVersion ? `--version ${watchVersion}` : ''} ${displayParsedCmd(watchCmdArguments ?? '')}`}
            </span>
          ) : (
            <span className="break-words text-sm">
              {`helm install {{RELEASE_NAME}} ${watchVersion ? `--version ${watchVersion}` : ''} ./${watchRootPath?.substring(1) ?? ''} ${displayParsedCmd(watchCmdArguments ?? '')}`}
            </span>
          )}
        </div>
      )}
      <Controller
        name="timeout_sec"
        control={control}
        defaultValue={600}
        rules={{
          required: 'Please enter a timeout.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Helm timeout"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
          />
        )}
      />
      <Controller
        name="allow_cluster_wide_resources"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <InputToggle
            title="Allow cluster-wide resources"
            description="Allow this chart to deploy resources outside of this environment namespace (including CRDs or non-namespaced resources)."
            className="mt-2"
            value={field.value}
            onChange={field.onChange}
            forceAlignTop
            small
          />
        )}
      />
    </div>
  )
}

export default DeploymentSetting
