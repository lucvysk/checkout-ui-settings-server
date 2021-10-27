import type {
  ClientsConfig,
  ParamsContext,
  RecorderState,
  ServiceContext,
} from '@vtex/api'
import { method, Service } from '@vtex/api'

import { Clients } from './clients'
import { enabledService } from './middlewares/enabled'
import { saveVB } from './middlewares/savevb'
import { getSettingsFromContext } from './middlewares/settings'

const TIMEOUT_MS = 800

declare global {
  type Context = ServiceContext<Clients>
}

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    masterdata: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
}

export default new Service<Clients, RecorderState, ParamsContext>({
  clients,
  routes: {
    enabled: method({
      GET: [enabledService],
    }),
    files: method({
      GET: [getSettingsFromContext],
    }),
    savevb: method({
      POST: [saveVB],
    }),
  },
})
