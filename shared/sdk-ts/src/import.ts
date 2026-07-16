import type { ApiFetcher } from './fetch-utils';
import { getBlob, postFormData } from './fetch-utils';
import { paths } from './schema';

export const IMPORT_ROUTES = {
  FILE: '/api/import/file',
  MAPPING: '/api/import/{import_id}/mapping',
  PREVIEW: '/api/import/{import_id}/preview',
  IMPORT: '/api/import/{import_id}/import',
  SAMPLE: '/api/import/sample',
  META: '/api/import/{import_id}',
} as const satisfies Record<string, keyof paths>;

export interface ImportMappingBody {
  mapping: Array<{ group?: string; from: string; to: string }>;
}

export interface ImportPreviewResponse {
  [key: string]: unknown;
}

export interface ImportFileMetaResponse {
  [key: string]: unknown;
}

export interface ImportProcessResponse {
  resource?: string;
  [key: string]: unknown;
}

export interface ImportFileUploadResource {
  importId: string;
  resource: string;
}

export interface ImportFileUploadResourceColumn {
  key: string;
  name: string;
  required?: boolean;
  hint?: string;
}

export interface ImportFileUploadResponse {
  import: ImportFileUploadResource;
  sheetColumns: string[];
  resourceColumns: ImportFileUploadResourceColumn[];
}

export interface ImportSampleParams {
  resource: string;
  format: 'csv' | 'xlsx';
}

export async function fetchImportPreview(
  fetcher: ApiFetcher,
  importId: string
): Promise<ImportPreviewResponse> {
  const get = fetcher
    .path(IMPORT_ROUTES.PREVIEW)
    .method('get')
    .create();
  const { data } = await get({ import_id: importId } as never);
  return (data ?? {}) as ImportPreviewResponse;
}

export async function fetchImportFileMeta(
  fetcher: ApiFetcher,
  importId: string
): Promise<ImportFileMetaResponse> {
  const get = fetcher.path(IMPORT_ROUTES.META).method('get').create();
  const { data } = await get({ import_id: importId } as never);
  return (data ?? {}) as ImportFileMetaResponse;
}

export async function importMapping(
  fetcher: ApiFetcher,
  importId: string,
  body: ImportMappingBody
): Promise<void> {
  const post = fetcher
    .path(IMPORT_ROUTES.MAPPING)
    .method('post')
    .create();
  await post({ import_id: importId, ...body } as never);
}

export async function importProcess(
  fetcher: ApiFetcher,
  importId: string
): Promise<ImportProcessResponse> {
  const post = fetcher.path(IMPORT_ROUTES.IMPORT).method('post').create();
  const { data } = await post({ import_id: importId } as never);
  return (data ?? {}) as ImportProcessResponse;
}

/**
 * Upload an import file via multipart/form-data. FormData carries the File part
 * plus `resource` and JSON-encoded `params` fields; the generated client's
 * typed JSON body is the wrong shape, so we post through a typed helper.
 */
export async function uploadImportFile(
  fetcher: ApiFetcher,
  formData: FormData
): Promise<ImportFileUploadResponse> {
  return postFormData<ImportFileUploadResponse>(
    fetcher,
    IMPORT_ROUTES.FILE,
    formData,
  );
}

/**
 * Download a csv/xlsx sample sheet as a binary Blob. The generated client
 * expects JSON, so we fetch through a typed blob helper.
 */
export async function downloadImportSample(
  fetcher: ApiFetcher,
  params: ImportSampleParams
): Promise<Blob> {
  return getBlob(
    fetcher,
    IMPORT_ROUTES.SAMPLE,
    { resource: params.resource, format: params.format },
    { Accept: params.format === 'xlsx' ? 'application/xlsx' : 'application/csv' },
  );
}
