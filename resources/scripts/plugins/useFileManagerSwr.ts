import useSWR from 'swr';
import loadDirectory, { PaginatedDirectory } from '@/api/server/files/loadDirectory';
import { cleanDirectoryPath } from '@/helpers';
import { ServerContext, ServerStore } from '@/state/server';

export const getDirectorySwrKey = (uuid: string, directory: string): string =>
    `${uuid}:files:${directory}`;

export default () => {
    // ✅ uuid certo
    const uuid = ServerContext.useStoreState(
        (state: ServerStore) => state.server.data!.uuid
    );

    // ✅ directory certo
    const directory = ServerContext.useStoreState(
        (state: ServerStore) => state.files.directory
    );

    const swr = useSWR<PaginatedDirectory>(
        getDirectorySwrKey(uuid, directory),
        () => loadDirectory(uuid, cleanDirectoryPath(directory)),
        {
            focusThrottleInterval: 30000,
            revalidateOnMount: false,
            refreshInterval: 0,
            errorRetryCount: 2,
        }
    );

    return {
        ...swr,

        // 👉 FileManager espera array
        data: swr.data?.data ?? [],

        // 👉 meta pra paginação futura
        meta: swr.data?.meta,
    };
};
