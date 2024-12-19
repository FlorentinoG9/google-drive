import { type GoogleCredentials, googleCredentialsSchema, optionalConfig, type OptionalConfig } from './types'

const GOOGLE_PICKER_API_URL = 'https://apis.google.com/js/api.js'
const GOOGLE_CLIENT_API_URL = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

export class GoogleDrivePicker {
  private readonly credentials: GoogleCredentials
  private readonly config: OptionalConfig

  constructor(credentials: GoogleCredentials, config?: OptionalConfig) {
    const credentialsResult = googleCredentialsSchema.safeParse(credentials)
    if (!credentialsResult.success) {
      throw new Error(`Invalid Google credentials: ${credentialsResult.error.message}`)
    }
    else {
      this.credentials = credentialsResult.data
    }

    const configResult = optionalConfig.safeParse(config)

    if (!configResult.success) {
      throw new Error(`Invalid Google configuration: ${configResult.error.message}`)
    }
    else {
      this.config = configResult.data
    }

    this.loadPickerApi()
    this.loadClientApi()
  }

  private async loadPickerApi() {
    const script = document.createElement('script')
    script.src = GOOGLE_PICKER_API_URL
    document.head.appendChild(script)
  }

  private async loadClientApi() {
    const script = document.createElement('script')
    script.src = GOOGLE_CLIENT_API_URL
    document.head.appendChild(script)
  }
}
