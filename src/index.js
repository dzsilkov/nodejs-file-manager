import { createInterface } from 'node:readline/promises';
import { cwd, chdir, stdin as input, stdout as output } from 'node:process';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpus, arch, userInfo, EOL } from 'node:os';
import fs from 'node:fs/promises';
import { OperationFailedError } from './error/operation-failed-error.class.js';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline, finished } from 'node:stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { createHash } from 'node:crypto';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const greet = userName => `Welcome to the File Manager, ${ userName }!`;

const goodbye = userName => `Thank you for using File Manager, ${ userName }, goodbye!`;

const parseCommand = (line) => {
    const [ cmd, ...args ] = line.trim().split(' ');
    console.log(cmd);
    console.log(args);
    return {
        cmd,
        args: getArgs(args),
    };
};

const getArgs = (args) => {
    if (!args || !args.length) {
        return '';
    }
    const [ first, second, third ] = args;
    // const arg = line.trim().split(' ')?.[1];
    if (first && first.startsWith('--')) {
        return [ first.slice(2) ];
    }
    if (first && !second) {
        return [ first ];
    }
    if (first && second) {
        return [ first, second ];
    }
};

const getUserName = () => {
    const defaultUserName = 'Guest';
    return process.argv
        .find(arg => arg.startsWith('--username='))
        ?.split('=')[1] ?? defaultUserName;
};

const onLsCommand = async (path) => {
    try {
        const files = await fs.readdir(path, { withFileTypes: true });
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
    } catch (e) {
        if (e.code === 'ENOENT') {
            throw new Error(`FS_OPERATION_FAILED`);
        }
    }
};

const onUpCommand = () => chdir('..');
const onOsEOLCommand = () => console.log(JSON.stringify(EOL));
const onOsHomedirCommand = () => console.log(homedir());
const onOsUserName = () => console.log(userInfo({ encoding: 'utf-8' }));
const onOsArchitecture = () => console.log(arch());

const onOsCpusCommand = () => {
    const cpusData = cpus().map(({ model: Model, speed: Speed }) => ({ Model, Speed, }));
    console.table(cpusData);
};

const onCdCommand = ([ destPath ]) => chdir(resolve(destPath));
const onCompressCommand = async ([ srcPath, destPath ]) => {
    try {
        const readStream = createReadStream(srcPath);
        const writeStream = createWriteStream(destPath);
        await pipeline(readStream, createBrotliCompress(), writeStream);
    } catch (e) {
        console.log(e);
    }
};
const onDecompressCommand = async ([ srcPath, destPath ]) => {
    try {
        const readStream = createReadStream(resolve(srcPath));
        const writeStream = createWriteStream(resolve(destPath));
        await pipeline(readStream, createBrotliDecompress(), writeStream);
    } catch (e) {
        console.log(e);
    }
};

const onCatCommand = async ([ readPath ]) => {
    try {
        const fileStream = createReadStream(resolve(readPath), { encoding: 'utf8' });
        fileStream.pipe(output);
        await finished(fileStream);
    } catch {
        throw new OperationFailedError();
    }
};

const onAddCommand = async ([ fileName, content = '' ]) => {
    try {
        const filePath = resolve(cwd(), fileName);
        await fs.writeFile(filePath, content, { flag: 'wx' });
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};

const onRenameCommand = async ([ pathToFile, newFileName ]) => {
    try {
        const filePath = resolve(cwd(), pathToFile);
        await fs.rename(filePath, newFileName);
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};

const onRemoveCommand = async ([ pathToFile ]) => {
    try {
        await fs.rm(resolve(pathToFile));
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};

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
    try {
        const stat = await fs.stat(resolve(srcPath));
        if (stat.isFile()) {
            await fs.copyFile(resolve(srcPath), resolve(destPath), fs.constants.COPYFILE_EXCL);
        }
        if (stat.isDirectory()) {
            await copyDir(resolve(srcPath), resolve(destPath));
        }
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};

const onMoveCommand = async ([ srcPath, destPath ]) => {
    try {
        const stat = await fs.stat(resolve(srcPath));
        if (stat.isFile()) {
            await fs.copyFile(resolve(srcPath), resolve(destPath), fs.constants.COPYFILE_EXCL);
            await fs.rm(resolve(srcPath));
        }
        if (stat.isDirectory()) {
            await copyDir(resolve(srcPath), resolve(destPath));
            await fs.rm(resolve(srcPath), { recursive: true });
        }
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};

const onHashCommand = async ([ srcPath ]) => {
    try {
        const fileStream = createReadStream(resolve(srcPath));
        const hash = createHash('sha256');
        fileStream.pipe(hash).on('finish', () => {
            console.log(hash.digest('hex'));
        });
        await finished(fileStream);
    } catch (e) {
        console.log(e);
        throw new OperationFailedError();
    }
};


const handleOsCommand = ([ args ]) => {
    const actions = {
        'EOL': () => onOsEOLCommand(),
        'cpus': () => onOsCpusCommand(),
        'homedir': () => onOsHomedirCommand(),
        'username': () => onOsUserName(),
        'architecture': () => onOsArchitecture()
    };
    return actions[args];
};

const handleCommand = (line, commands) => {
    const { cmd, args } = parseCommand(line);
    console.log(args);
    const actions = {
        'ls': () => onLsCommand(cwd()),
        'up': () => onUpCommand(),
        'cd': () => onCdCommand(args),
        'cat': () => onCatCommand(args),
        'add': () => onAddCommand(args),
        'rn': () => onRenameCommand(args),
        'cp': () => onCopyCommand(args),
        'mv': () => onMoveCommand(args),
        'rm': () => onRemoveCommand(args),
        'os': () => executeCommand(handleOsCommand(args)),
        'hash': () => onHashCommand(args),
        'compress': () => onCompressCommand(args),
        'decompress': () => onDecompressCommand(args),
    };
    return actions[cmd];
};

const executeCommand = async (command) => {
    try {
        await command();
    } catch (e) {
        throw new OperationFailedError();
    }
};

const start = () => {
    try {
        const rl = createInterface({
            input,
            output,
        });

        console.log(greet(getUserName()));

        chdir(homedir());

        console.log(`You are currently in: ${ homedir() }`);

        rl.prompt();

        rl.on('line', (line) => {
            executeCommand(handleCommand(line))
                .catch(e => console.log(e.message))
                .finally(() => {
                    console.log(`You are currently in: ${ cwd() }`);
                    rl.prompt();
                });
        });

        rl.on('SIGINT', () => {
            console.log(goodbye(getUserName()));
            rl.close();
        });
    } catch (e) {
        console.log(e);
    }
};

start();