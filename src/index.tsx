import type {
  AuthResult,
  GooglePickerView,
  PickerConfiguration,
} from './typeDefs'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { defaultConfiguration } from './typeDefs'
import useInjectScript from './useInjectScript'

const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js'
const GOOGLE_GSI_URL = 'https://accounts.google.com/gsi/client'
const DEFAULT_SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

interface PickerState {
  isAuthenticated: boolean
  isPickerApiLoaded: boolean
  currentConfig: PickerConfiguration
}

export default function useDrivePicker(): [
  (config: PickerConfiguration) => boolean | undefined,
  AuthResult | undefined,
] {
  const pickerRef = useRef<any>(null)

  // Load required scripts
  const [gApiLoaded, gApiError] = useInjectScript(GOOGLE_SDK_URL)
  const [gsiLoaded, gsiError] = useInjectScript(GOOGLE_GSI_URL)

  // State management
  const [state, setState] = useState<PickerState>({
    isAuthenticated: false,
    isPickerApiLoaded: false,
    currentConfig: defaultConfiguration,
  })
  const [authResult, setAuthResult] = useState<AuthResult>()

  // Memoized state checks
  const isReady = useMemo(() => {
    return (
      gApiLoaded
      && !gApiError
      && gsiLoaded
      && !gsiError
      && state.isPickerApiLoaded
    )
  }, [gApiLoaded, gApiError, gsiLoaded, gsiError, state.isPickerApiLoaded])

  // Initialize Google Picker API
  const loadPickerApi = useCallback(() => {
    window.gapi.load('picker', {
      callback: () => {
        setState(prev => ({ ...prev, isPickerApiLoaded: true }))
      },
    })
  }, [])

  useEffect(() => {
    if (gApiLoaded && !gApiError && !state.isPickerApiLoaded) {
      loadPickerApi()
    }
  }, [gApiLoaded, gApiError, state.isPickerApiLoaded, loadPickerApi])

  // Create and configure picker
  const createPicker = useCallback(
    (config: PickerConfiguration) => {
      if (!isReady || !config.token)
        return false

      try {
        const view = new window.google.picker.DocsView(
          window.google.picker.ViewId[config.viewId || 'DOCS'],
        )

        // Configure view
        if (config.viewMimeTypes)
          view.setMimeTypes(config.viewMimeTypes)
        if (config.setIncludeFolders)
          view.setIncludeFolders(true)
        if (config.setSelectFolderEnabled)
          view.setSelectFolderEnabled(true)
        if (config.setParentFolder)
          view.setParent(config.setParentFolder)

        // Configure upload view if needed
        let uploadView: GooglePickerView | undefined
        if (config.showUploadView) {
          uploadView = new window.google.picker.DocsUploadView()
          if (config.viewMimeTypes)
            uploadView.setMimeTypes(config.viewMimeTypes)
          if (config.showUploadFolders)
            uploadView.setIncludeFolders(true)
          if (config.setParentFolder)
            uploadView.setParent(config.setParentFolder)
        }

        // Build picker
        const builder = new window.google.picker.PickerBuilder()
          .setAppId(config.appId || '')
          .setOAuthToken(config.token)
          .setDeveloperKey(config.developerKey)
          .setLocale(config.locale || 'en')
          .setCallback(config.callbackFunction)

        if (config.setOrigin)
          builder.setOrigin(config.setOrigin)
        if (!config.disableDefaultView)
          builder.addView(view)
        if (config.customViews) {
          config.customViews.forEach(view => builder.addView(view))
        }
        if (config.multiselect) {
          builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        }
        if (uploadView)
          builder.addView(uploadView)
        if (config.supportDrives) {
          builder.enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
        }

        pickerRef.current = builder.build()
        pickerRef.current.setVisible(true)
        return true
      }
      catch (error) {
        console.error('Error creating picker:', error)
        return false
      }
    },
    [isReady],
  )

  // Handle picker opening
  const openPicker = useCallback(
    (config: PickerConfiguration) => {
      if (config.disabled)
        return false

      setState(prev => ({ ...prev, currentConfig: config }))

      if (!config.token) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: config.clientId,
          scope: (config.customScopes
            ? [...DEFAULT_SCOPES, ...config.customScopes]
            : DEFAULT_SCOPES
          ).join(' '),
          callback: (response: AuthResult) => {
            setAuthResult(response)
            createPicker({ ...config, token: response.access_token })
          },
        })

        client.requestAccessToken()
        return undefined
      }

      return createPicker(config)
    },
    [createPicker],
  )

  return [openPicker, authResult]
}
