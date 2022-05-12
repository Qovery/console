import { Application, Status } from 'qovery-typescript-axios'

export interface ApplicationEntity extends Application {
  status?: Status
}
