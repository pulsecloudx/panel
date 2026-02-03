import http from '@/api/http';
import { rawDataToFileObject } from '@/api/transformers';

export interface FileObject {
    key: string;
    name: string;
    mode: string;
    modeBits: string;
    size: number;
    isFile: boolean;
    isSymlink: boolean;
    mimetype: string;
    createdAt: Date;
    modifiedAt: Date;
    isArchiveType: () => boolean;
    isEditable: () => boolean;
}

export interface DirectoryMeta {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface PaginatedDirectory {
    data: FileObject[];
    meta: DirectoryMeta;
}

/**
 * Loads a directory listing.
 *
 * NOTE: This calls the Panel endpoint:
 *   GET /api/client/servers/:uuid/files/list
 *
 * Your Panel must forward `page` + `per_page` to Wings and return:
 *   { data: [...], meta: {...} }
 */
export default async (
    uuid: string,
    directory: string = '/',
    page: number = 1,
    perPage: number = 100
): Promise<PaginatedDirectory> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/files/list`, {
        params: {
            directory,
            page,
            per_page: perPage,
        },
    });

    // ✅ compat: se o Panel ainda retornar o formato antigo (array dentro de data.data)
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];

    // caso novo formato:
    const meta: DirectoryMeta | null = data?.meta
        ? {
              total: Number(data.meta.total ?? items.length),
              page: Number(data.meta.page ?? page),
              per_page: Number(data.meta.per_page ?? perPage),
              total_pages: Number(data.meta.total_pages ?? 1),
          }
        : null;

    // se já veio `data.data` como array e `meta` existe, usa direto
    if (Array.isArray(data?.data) && meta) {
        return {
            data: data.data.map(rawDataToFileObject),
            meta,
        };
    }

    // se ainda não tem meta, embrulha pra não quebrar o resto do front
    return {
        data: items.map(rawDataToFileObject),
        meta:
            meta ??
            ({
                total: items.length,
                page: 1,
                per_page: items.length,
                total_pages: 1,
            } as DirectoryMeta),
    };
};
