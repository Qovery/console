import { match } from 'ts-pattern'

export type FilterType = 'ALL' | 'DEPLOY' | 'BUILD' | 'EXECUTING'

// Waiting back-end to provide correct step names from API documentation
// https://qovery.slack.com/archives/C02NPSG2HBL/p1728485209941179?thread_ts=1727785723.481289&cid=C02NPSG2HBL
export enum EnvironmentEngineStep {
  // Build steps
  Build = 'Build',
  Built = 'Built',
  BuiltError = 'BuiltError',

  // Deploy steps
  Deploy = 'Deploy',
  Deployed = 'Deployed',
  DeployedError = 'DeployedError',
  Cancel = 'Cancel',
  Cancelled = 'Cancelled',
  Pause = 'Pause',
  Paused = 'Paused',
  PausedError = 'PausedError',
  Delete = 'Delete',
  Deleted = 'Deleted',
  DeletedError = 'DeletedError',
  LoadConfiguration = 'LoadConfiguration',
  Terminated = 'Terminated',
  Recap = 'Recap',
  Restart = 'Restart',
  Restarted = 'Restarted',
  RestartedError = 'RestartedError',

  // Executing steps
  Executing = 'Executing',

  // Pre-check steps
  PreCheck = 'PreCheck',
  Start = 'Start',
  RetrieveClusterConfig = 'RetrieveClusterConfig',
  RetrieveClusterResources = 'RetrieveClusterResources',
  ValidateSystemRequirements = 'ValidateSystemRequirements',
  ValidateApiInput = 'ValidateApiInput',

  // Configuration transfer
  JobOutput = 'JobOutput',
  DatabaseOutput = 'DatabaseOutput',

  // Global error
  GlobalError = 'GlobalError',

  // Default value
  Unknown = 'Unknown',
}

export const getFilterStep = (step: EnvironmentEngineStep): FilterType =>
  match(step)
    .with(
      EnvironmentEngineStep.Build,
      EnvironmentEngineStep.Built,
      EnvironmentEngineStep.BuiltError,
      () => 'BUILD' as const
    )
    .with(
      EnvironmentEngineStep.Deploy,
      EnvironmentEngineStep.Deployed,
      EnvironmentEngineStep.DeployedError,
      EnvironmentEngineStep.Cancel,
      EnvironmentEngineStep.Cancelled,
      EnvironmentEngineStep.Pause,
      EnvironmentEngineStep.Paused,
      EnvironmentEngineStep.PausedError,
      EnvironmentEngineStep.Delete,
      EnvironmentEngineStep.Deleted,
      EnvironmentEngineStep.DeletedError,
      EnvironmentEngineStep.LoadConfiguration,
      EnvironmentEngineStep.Terminated,
      EnvironmentEngineStep.Recap,
      EnvironmentEngineStep.Restart,
      EnvironmentEngineStep.Restarted,
      EnvironmentEngineStep.RestartedError,
      () => 'DEPLOY' as const
    )
    .with(EnvironmentEngineStep.Executing, () => 'EXECUTING' as const)
    // TODO: theses steps are not yet available
    // .with(
    //   EnvironmentEngineStep.PreCheck,
    //   EnvironmentEngineStep.Start,
    //   EnvironmentEngineStep.RetrieveClusterConfig,
    //   EnvironmentEngineStep.RetrieveClusterResources,
    //   EnvironmentEngineStep.ValidateSystemRequirements,
    //   EnvironmentEngineStep.ValidateApiInput,
    //   () => 'Pre-check' as const
    // )
    // .with(EnvironmentEngineStep.JobOutput, EnvironmentEngineStep.DatabaseOutput, () => 'Configuration' as const)
    // .with(EnvironmentEngineStep.GlobalError, () => 'All' as const)
    .otherwise(() => 'ALL' as const)
