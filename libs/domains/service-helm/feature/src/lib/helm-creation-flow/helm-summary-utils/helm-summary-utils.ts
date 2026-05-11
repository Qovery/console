import {
  type HelmRequest,
  type HelmRequestAllOfValuesOverride,
  type HelmRequestAllOfValuesOverrideFile,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type HelmGeneralData, buildHelmSourceFromGeneralData } from '@qovery/domains/services/feature'
import { parseCmd } from '@qovery/shared/util-js'
import {
  type ArgumentTypes,
  type HelmValuesArgumentsData,
} from '../../values-override-arguments-setting/values-override-arguments-setting'
import { type HelmValuesFileData } from '../../values-override-files-setting/values-override-files-setting'

export interface BuildHelmCreatePayloadProps {
  generalData: HelmGeneralData
  valuesOverrideFileData: HelmValuesFileData
  valuesOverrideArgumentsData: HelmValuesArgumentsData
}

export function splitHelmOverridePaths(paths?: string): string[] {
  if (!paths) {
    return []
  }

  return paths
    .split(/[;,]/)
    .map((path) => path.trim())
    .filter(Boolean)
}

function getValuesByType(
  valuesOverrideArgumentsData: HelmValuesArgumentsData,
  type: ArgumentTypes
): Array<Array<string>> {
  return valuesOverrideArgumentsData.arguments
    .filter((argument) => argument.type === type)
    .map((argument) => [argument.key, argument.json ?? argument.value])
}

export function buildHelmValuesOverrideFile(
  valuesOverrideFileData: HelmValuesFileData
): HelmRequestAllOfValuesOverrideFile | null {
  return match(valuesOverrideFileData.type)
    .with('GIT_REPOSITORY', () => ({
      git: {
        git_repository: {
          provider: valuesOverrideFileData.provider ?? 'GITHUB',
          url: valuesOverrideFileData.git_repository?.url ?? valuesOverrideFileData.repository ?? '',
          branch: valuesOverrideFileData.branch ?? '',
          git_token_id: valuesOverrideFileData.git_token_id,
        },
        paths: splitHelmOverridePaths(valuesOverrideFileData.paths),
      },
    }))
    .with('YAML', () => ({
      raw: {
        values: [
          {
            name: 'override',
            content: valuesOverrideFileData.content ?? '',
          },
        ],
      },
    }))
    .with('NONE', () => null)
    .exhaustive()
}

export function buildHelmValuesOverride(
  valuesOverrideFileData: HelmValuesFileData,
  valuesOverrideArgumentsData: HelmValuesArgumentsData
): HelmRequestAllOfValuesOverride {
  return {
    set: getValuesByType(valuesOverrideArgumentsData, '--set'),
    set_string: getValuesByType(valuesOverrideArgumentsData, '--set-string'),
    set_json: getValuesByType(valuesOverrideArgumentsData, '--set-json'),
    file: buildHelmValuesOverrideFile(valuesOverrideFileData),
  }
}

export function buildHelmCreatePayload({
  generalData,
  valuesOverrideFileData,
  valuesOverrideArgumentsData,
}: BuildHelmCreatePayloadProps): HelmRequest {
  const timeoutSec = Number.parseInt(String(generalData.timeout_sec), 10)

  return {
    name: generalData.name,
    description: generalData.description,
    icon_uri: generalData.icon_uri,
    source: buildHelmSourceFromGeneralData(generalData),
    allow_cluster_wide_resources: generalData.allow_cluster_wide_resources,
    arguments: parseCmd(generalData.arguments),
    timeout_sec: Number.isNaN(timeoutSec) ? 0 : timeoutSec,
    auto_deploy: Boolean(generalData.auto_deploy || valuesOverrideFileData.auto_deploy),
    values_override: buildHelmValuesOverride(valuesOverrideFileData, valuesOverrideArgumentsData),
  }
}
