import type { ZodError } from 'zod'

import { type GoogleConfig, type GoogleCredentials, googleCredentialsSchema, optionalConfig } from './types'

const GOOGLE_PICKER_API_URL = 'https://apis.google.com/js/api.js'
const GOOGLE_CLIENT_API_URL = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

class GoogleService {
  private credentials: GoogleCredentials
  private config: GoogleConfig

  private tokenClient: any
  private accessToken: string | undefined
  private pickerInited = false
  private gisInited = false

  constructor(clientId: GoogleCredentials['clientId'], developerKey: GoogleCredentials['developerKey'], appId: GoogleCredentials['appId'], config?: GoogleConfig) {
    try {
      const parsedCredentials = googleCredentialsSchema.parse({ clientId, developerKey, appId })
      const parsedConfig = optionalConfig.parse(config)

      this.config = parsedConfig
      this.credentials = parsedCredentials

      this.initLoader()
    }
    catch (error) {
      const zodErrors = error as ZodError

      const errors = JSON.stringify(zodErrors.flatten().fieldErrors, null, 2)

      console.error(errors)

      throw new Error(`Invalid Google configuration: ${errors}`)
    }
  }

  private async initLoader() {
    await this.loadClientApi()
    await this.loadPickerApi()
  }

  private async loadPickerApi() {
    const script = document.createElement('script')
    script.src = GOOGLE_PICKER_API_URL
    script.onload = () => {
      this.onApiLoad()
    }
    script.defer = true
    script.async = true
    document.head.appendChild(script)
  }

  private async loadClientApi() {
    const script = document.createElement('script')
    script.src = GOOGLE_CLIENT_API_URL
    script.onload = () => {
      this.gisLoaded()
    }
    script.defer = true
    script.async = true
    document.head.appendChild(script)
  }

  private onApiLoad() {
    window.gapi.load('picker', {
      callback: () => this.onPickerApiLoad(),
    })
  }

  private async onPickerApiLoad() {
    this.pickerInited = true
  }

  private gisLoaded() {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: this.getCredentials().clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (tokenResponse: any) => {
        if (tokenResponse.error !== undefined) {
          throw new Error(tokenResponse.error)
        }
        this.accessToken = tokenResponse.access_token
      },
    })

    this.setTokenClient(client)
    this.gisInited = true
  }

  getMimeTypes() {
    return this.config?.viewMimeTypes ?? []
  }

  getViewId() {
    return this.config?.viewId ?? 'DOCS'
  }

  getScopes() {
    return this.config?.scopes ?? ['https://www.googleapis.com/auth/drive.file.readonly']
  }

  getAccessToken() {
    return this.accessToken
  }

  getCredentials() {
    return this.credentials
  }

  getConfig() {
    return this.config
  }

  getPickerInited() {
    return this.pickerInited
  }

  getGisInited() {
    return this.gisInited
  }

  getTokenClient() {
    return this.tokenClient
  }

  protected setTokenClient(client: any) {
    this.tokenClient = client
  }

  getPickerCallback() {
    return this.config?.pickerCallback
  }

  protected setAccessToken(accessToken: string) {
    this.accessToken = accessToken
  }
}

class GooglePickerLoader extends GoogleService {
  constructor(clientId: GoogleCredentials['clientId'], developerKey: GoogleCredentials['developerKey'], appId: GoogleCredentials['appId'], config?: GoogleConfig) {
    super(clientId, developerKey, appId, config)
  }

  createPicker() {
    const showPicker = () => {
      if (!this.getPickerInited()) {
        console.error('Picker API not loaded yet')
        return
      }

      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId[this.getViewId()])
        .setOAuthToken(this.getAccessToken())
        .setDeveloperKey(this.getCredentials().developerKey)
        .setCallback(this.getPickerCallback())
        .setAppId(this.getCredentials().appId)
        .build()
      picker.setVisible(true)
    }

    if (!this.getAccessToken()) {
      this.getTokenClient().callback = (response: any) => {
        if (response.error !== undefined) {
          throw new Error(response.error)
        }
        this.setAccessToken(response.access_token)
        showPicker()
      }
      this.getTokenClient().requestAccessToken({ prompt: 'consent' })
    }
    else {
      showPicker()
    }
  }
}

export { GooglePickerLoader }
