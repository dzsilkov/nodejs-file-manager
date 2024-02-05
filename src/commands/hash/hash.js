import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { finished } from 'node:stream/promises';

export const onHashCommand = async ([ srcPath ]) => {
    const fileStream = createReadStream(resolve(srcPath));
    const hash = createHash('sha256');
    fileStream.pipe(hash).on('finish', () => {
        console.log(hash.digest('hex'));
    });
    await finished(fileStream);
};
