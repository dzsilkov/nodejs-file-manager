import fs from 'node:fs/promises';
import { chdir, cwd } from 'node:process';
import { resolve } from 'node:path';

const onLsCommand = async () => {
    const files = await fs.readdir(cwd(), { withFileTypes: true });
    const data = files
        .map((file) => ({ Name: file.name, Type: file.isFile() ? 'file' : 'directory' }))
        .sort((a, b) => {
            if (a.Type > b.Type) {
                return 1;
            }
            if (a.Type < b.Type) {
                return -1;
            }
            return 0;
        });
    console.table(data);
};

const onCdCommand = ([ destPath ]) => chdir(resolve(destPath));

const onUpCommand = () => chdir('..');

export {
    onUpCommand,
    onCdCommand,
    onLsCommand
};