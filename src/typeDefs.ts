export interface CallbackDoc {
  downloadUrl?: string
  uploadState?: string
  description: string
  driveSuccess: boolean
  embedUrl: string
  iconUrl: string
  id: string
  isShared: boolean
  lastEditedUtc: number
  mimeType: string
  name: string
  rotation: number
  rotationDegree: number
  serviceId: string
  sizeBytes: number
  type: string
  url: string
}

export interface PickerCallback {
  action: 'picked' | 'cancel' | 'loaded'
  docs: CallbackDoc[]
}

export interface AuthResult {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  scope: string
  authUser: string
  prompt: string
}

export type ViewIdOptions =
  | 'DOCS'
  | 'DOCS_IMAGES'
  | 'DOCS_IMAGES_AND_VIDEOS'
  | 'DOCS_VIDEOS'
  | 'DOCUMENTS'
  | 'DRAWINGS'
  | 'FOLDERS'
  | 'FORMS'
  | 'PDFS'
  | 'SPREADSHEETS'
  | 'PRESENTATIONS'

export interface PickerConfiguration {
  clientId: string
  developerKey: string
  viewId?: ViewIdOptions
  viewMimeTypes?: string
  setIncludeFolders?: boolean
  setSelectFolderEnabled?: boolean
  disableDefaultView?: boolean
  token?: string
  setOrigin?: string
  multiselect?: boolean
  disabled?: boolean
  appId?: string
  supportDrives?: boolean
  showUploadView?: boolean
  showUploadFolders?: boolean
  setParentFolder?: string
  customViews?: GooglePickerView[]
  locale?: string
  customScopes?: string[]
  callbackFunction: (data: PickerCallback) => void
}

export interface GooglePickerView {
  setIncludeFolders: (include: boolean) => GooglePickerView
  setMimeTypes: (mimeTypes: string) => GooglePickerView
  setSelectFolderEnabled: (enabled: boolean) => GooglePickerView
  setParent: (parentId: string) => GooglePickerView
}

export interface GooglePickerBuilder {
  addView: (view: GooglePickerView) => GooglePickerBuilder
  setAppId: (appId: string) => GooglePickerBuilder
  setOAuthToken: (token: string) => GooglePickerBuilder
  setDeveloperKey: (key: string) => GooglePickerBuilder
  setLocale: (locale: string) => GooglePickerBuilder
  setCallback: (callback: (data: PickerCallback) => void) => GooglePickerBuilder
  setOrigin: (origin: string) => GooglePickerBuilder
  enableFeature: (feature: string) => GooglePickerBuilder
  build: () => GooglePicker
}

export interface GooglePicker {
  setVisible: (visible: boolean) => void
}

export const defaultConfiguration: PickerConfiguration = {
  clientId: '',
  developerKey: '',
  viewId: 'DOCS',
  callbackFunction: () => undefined,
}

declare global {
  interface Window {
    gapi: {
      load: (api: string, options?: { callback: () => void }) => void
    }
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: AuthResult) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
      picker: {
        Feature: {
          MULTISELECT_ENABLED: string
          SUPPORT_DRIVES: string
        }
        ViewId: Record<ViewIdOptions, string>
        DocsView: new (viewId?: string) => GooglePickerView
        DocsUploadView: new () => GooglePickerView
        PickerBuilder: new () => GooglePickerBuilder
      }
    }
  }
}
