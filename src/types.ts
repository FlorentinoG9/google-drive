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

export const optionalConfig = z.object({
  showUploadView: z.boolean().default(false).describe('Show upload view'),
  multiselect: z.boolean().default(false).describe('Enable multiselect'),
  customViews: z.array(customMimeTypes).default([]).describe('Custom views to be displayed in the picker'),
  supportDrives: z.boolean().default(false).describe('Support shared drives'),
  viewMimeTypes: z.array(customMimeTypes).default([]).describe('Mime types to be displayed in the picker'),
  scopes: googleScopeSchema.default([scopes.Values['https://www.googleapis.com/auth/drive.readonly']]).describe('Scopes to be used in the picker'),
  viewId: viewIdOptions.default(viewIdOptions.Values.DOCS).describe('View id to be used in the picker'),
}).partial().optional()

export const googleCredentialsSchema = z.object({
  clientId: z.string().trim(),
  developerKey: z.string().trim(),
})

export type OptionalConfig = z.infer<typeof optionalConfig>
export type GoogleCredentials = z.infer<typeof googleCredentialsSchema>
export type GoogleScopes = z.infer<typeof scopes>
export type ViewId = z.infer<typeof viewIdOptions>
