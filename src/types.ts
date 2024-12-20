import { z } from 'zod'

const scopes = z.enum([
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.appdata.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.file.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
])

const googleScopeSchema = z.array(scopes)

const viewIdOptions = z.enum(['DOCS', 'DOCS_IMAGES', 'DOCS_IMAGES_AND_VIDEOS', 'DOCS_VIDEOS', 'DOCUMENTS', 'DRAWINGS', 'FOLDERS', 'FORMS', 'PDFS'])

const MIME_TYPE_PREFIX = 'application/vnd.google-apps.'

const _viewMimeTypes = z.enum(['audio', 'document', 'drive-sdk', 'drawing', 'file', 'folder', 'form', 'fusiontable', 'jam', 'mail-layout', 'map', 'photo', 'presentation', 'script', 'shortcut', 'site', 'spreadsheet', 'unknown', 'vid', 'video'])
export type ViewMimeType = z.infer<typeof _viewMimeTypes>
const customMimeTypes = z.custom<`${typeof MIME_TYPE_PREFIX}${ViewMimeType}`>(mimeType => mimeType.startsWith(MIME_TYPE_PREFIX))

const callbackArgs = z.object({
  action: z.string(),
  docs: z.object({
    downloadUrl: z.string().optional(),
    uploadState: z.string().optional(),
    description: z.string(),
    driveSuccess: z.boolean(),
    embedUrl: z.string(),
    iconUrl: z.string(),
    id: z.string(),
    isShared: z.boolean(),
    lastEditedUtc: z.number(),
    mimeType: z.string(),
    name: z.string(),
    rotation: z.number(),
    rotationDegree: z.number(),
    serviceId: z.string(),
    sizeBytes: z.number(),
    type: z.string(),
    url: z.string(),
  }).array(),
})

const pickerCallback = ({
  pickerCallback: z.function().args(callbackArgs),
})

export const optionalConfig = z.object({
  showUploadView: z.boolean().default(false).describe('Show upload view'),
  multiselect: z.boolean().default(false).describe('Enable multiselect'),
  customViews: z.array(customMimeTypes).describe('Custom views to be displayed in the picker'),
  supportDrives: z.boolean().default(false).describe('Support shared drives'),
  viewMimeTypes: z.array(customMimeTypes).describe('Mime types to be displayed in the picker'),
  scopes: googleScopeSchema,
  viewId: viewIdOptions.default(viewIdOptions.Values.DOCS),
}).partial().extend(pickerCallback).optional()

export const googleCredentialsSchema = z.object({
  clientId: z.string().trim(),
  developerKey: z.string().trim(),
  appId: z.string().trim(),
})

export type GoogleConfig = z.infer<typeof optionalConfig>
export type GoogleCredentials = z.infer<typeof googleCredentialsSchema>
export type GoogleScope = z.infer<typeof scopes>
export type ViewId = z.infer<typeof viewIdOptions>
