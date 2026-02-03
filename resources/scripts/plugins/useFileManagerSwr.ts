import useSWR from 'swr';
import loadDirectory, { FileObject, PaginatedDirectory } from '@/api/server/files/loadDirectory';
import { cleanDirectoryPath } from '@/helpers';
import { ServerContext } from '@/state/server';

export const getDirectorySwrKey = (uuid: string, directory: string): string =>
    `${uuid}:files:${directory}`;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

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

        // 🔥 aqui está a mágica
        data: swr.data?.data ?? [],
        meta: swr.data?.meta,
    };
};
