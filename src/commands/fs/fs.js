import { resolve } from 'node:path';
import { cwd } from 'node:process';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { finished } from 'node:stream/promises';
import { OperationFailedError } from '../../error/index.js';

const onAddCommand = async ([ fileName, content = '' ]) => {
    const filePath = resolve(cwd(), fileName);
    await fs.writeFile(filePath, content, { flag: 'wx' });
};

const onRenameCommand = async ([ pathToFile, newFileName ]) => {
    const isTargetExist = !!(await fs.stat(newFileName).catch(() => false));
    if (isTargetExist) {
        throw new OperationFailedError();
    } else {
        const filePath = resolve(cwd(), pathToFile);
        await fs.rename(filePath, resolve(newFileName));
    }
};

const onRemoveCommand = async ([ pathToFile ]) => await fs.rm(resolve(pathToFile));

const copyDir = async (srcPath, destPath) => {
    const srcFiles = await fs.readdir(srcPath, { withFileTypes: true });
    await fs.mkdir(destPath, { recursive: false });
    return Promise.all(
        srcFiles.map(async (file) => file.isFile()
            ? await fs.copyFile(resolve(file.path, file.name), resolve(destPath, file.name))
            : await copyDir(resolve(file.path, file.name), resolve(destPath, file.name))
        )
    );
};

const onCopyCommand = async ([ srcPath, destPath ]) => {
    const stat = await fs.stat(resolve(srcPath));
    if (stat.isFile()) {
        await fs.copyFile(resolve(srcPath), resolve(destPath), fs.constants.COPYFILE_EXCL);
    }
    if (stat.isDirectory()) {
        await copyDir(resolve(srcPath), resolve(destPath));
    }
};

const onMoveCommand = async ([ srcPath, destPath ]) => {
    await onCopyCommand([ srcPath, destPath ]);
    await fs.rm(resolve(srcPath), { recursive: true });
};

const onCatCommand = async ([ readPath ]) => {
    const fileStream = createReadStream(resolve(readPath), { encoding: 'utf8' });
    fileStream.on('data', (data) => {
        console.log(data);
    });
    await finished(fileStream);
};


export {
    onCatCommand,
    onCopyCommand,
    onMoveCommand,
    onAddCommand,
    onRenameCommand,
    onRemoveCommand
};