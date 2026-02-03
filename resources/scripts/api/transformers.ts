import { Allocation } from '@/api/server/getServer';
import { FractalResponseData } from '@/api/http';
import { FileObject } from '@/api/server/files/loadDirectory';
import { ServerBackup, ServerEggVariable } from '@/api/server/types';

export const rawDataToServerAllocation = (data: FractalResponseData): Allocation => ({
    id: data.attributes.id,
    ip: data.attributes.ip,
    alias: data.attributes.ip_alias,
    port: data.attributes.port,
    notes: data.attributes.notes,
    isDefault: data.attributes.is_default,
});

const ARCHIVE_EXTENSIONS = new Set([
    'zip','rar','7z','tar','gz','bz2','xz','zst','lz','lz4','br'
]);

const EDITABLE_BLOCKED_MIME = [
    'application/octet-stream',
    'application/jar',
];

export const rawDataToFileObject = (data: FractalResponseData): FileObject => {
    const a = data.attributes;

    const extension = a.name?.split('.').pop()?.toLowerCase() ?? '';

    const isArchive =
        a.is_file &&
        (ARCHIVE_EXTENSIONS.has(extension) ||
         a.mimetype?.includes('zip') ||
         a.mimetype?.includes('compressed') ||
         a.mimetype?.includes('tar'));

    return {
        key: `${a.is_file ? 'file' : 'dir'}_${a.name}`,
        name: a.name,
        mode: a.mode,
        modeBits: a.mode_bits,
        size: Number(a.size),
        isFile: a.is_file,
        isSymlink: a.is_symlink,
        mimetype: a.mimetype,
        createdAt: new Date(a.created_at),
        modifiedAt: new Date(a.modified_at),

        isArchiveType: () => isArchive,

        isEditable: () => {
            if (!a.is_file || isArchive) return false;

            if (EDITABLE_BLOCKED_MIME.includes(a.mimetype)) return false;

            if (a.mimetype.startsWith('image/') && !a.mimetype.includes('svg'))
                return false;

            return true;
        },
    };
};


export const rawDataToServerBackup = ({ attributes }: FractalResponseData): ServerBackup => ({
    uuid: attributes.uuid,
    isSuccessful: attributes.is_successful,
    isLocked: attributes.is_locked,
    name: attributes.name,
    ignoredFiles: attributes.ignored_files,
    checksum: attributes.checksum,
    bytes: attributes.bytes,
    createdAt: new Date(attributes.created_at),
    completedAt: attributes.completed_at ? new Date(attributes.completed_at) : null,
});

export const rawDataToServerEggVariable = ({ attributes }: FractalResponseData): ServerEggVariable => ({
    name: attributes.name,
    description: attributes.description,
    envVariable: attributes.env_variable,
    defaultValue: attributes.default_value,
    serverValue: attributes.server_value,
    isEditable: attributes.is_editable,
    rules: attributes.rules.split('|'),
});
