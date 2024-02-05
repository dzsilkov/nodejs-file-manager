import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { resolve } from 'node:path';

const onCompressBrotliCommand = async ([ srcPath, destPath ]) => {
    const readStream = createReadStream(srcPath);
    const writeStream = createWriteStream(destPath);
    await pipeline(readStream, createBrotliCompress(), writeStream);
};
const onDecompressBrotliCommand = async ([ srcPath, destPath ]) => {
    const readStream = createReadStream(resolve(srcPath));
    const writeStream = createWriteStream(resolve(destPath));
    await pipeline(readStream, createBrotliDecompress(), writeStream);
};

export { onDecompressBrotliCommand, onCompressBrotliCommand };