import { onOsArchitecture, onOsCpusCommand, onOsEOLCommand, onOsHomedirCommand, onOsUserName } from './os/os.js';
import { onCdCommand, onLsCommand, onUpCommand } from './nwd/nwd.js';
import { onAddCommand, onCatCommand, onCopyCommand, onMoveCommand, onRemoveCommand, onRenameCommand } from './fs/fs.js';
import { onHashCommand } from './hash/hash.js';
import { onCompressBrotliCommand, onDecompressBrotliCommand } from './zip/brotli-zip.js';
import { OperationFailedError, InvalidInputError } from '../error/index.js';
import { parseCommand } from '../helpers/helpers.js';
import { cwd } from 'node:process';

const handelCommand = (cmd, commands) => commands[cmd];

const handleOsCommand = ([ cmd ]) => {
    const osCommands = {
        'EOL': () => onOsEOLCommand(),
        'cpus': () => onOsCpusCommand(),
        'homedir': () => onOsHomedirCommand(),
        'username': () => onOsUserName(),
        'architecture': () => onOsArchitecture()
    };
    return handelCommand(cmd, osCommands);
};

const handleMainCommand = line => {
    const { cmd, args } = parseCommand(line);
    const mainCommands = {
        '.exit': !args.length ? () => process.exit() : null,
        'ls': !args.length ? () => onLsCommand() : null,
        'up': !args.length ? () => onUpCommand(args) : null,
        'cd': args.length === 1 ? () => onCdCommand(args) : null,
        'cat': args.length === 1 ? () => onCatCommand(args) : null,
        'add': args.length === 1 ? () => onAddCommand(args) : null,
        'rn': args.length === 2 ? () => onRenameCommand(args) : null,
        'cp': args.length === 2 ? () => onCopyCommand(args) : null,
        'mv': args.length === 2 ? () => onMoveCommand(args) : null,
        'rm': args.length === 1 ? () => onRemoveCommand(args) : null,
        'os': args.length === 1 ? () => executeCommand(handleOsCommand(args)) : null,
        'hash': args.length === 1 ? () => onHashCommand(args) : null,
        'compress': args.length === 2 ? () => onCompressBrotliCommand(args) : null,
        'decompress': args.length === 2 ? () => onDecompressBrotliCommand(args) : null,
    };
    return handelCommand(cmd, mainCommands);
};

const sayHiCommand = (userName) => console.log(`Welcome to the File Manager, ${ userName }!`);

const sayByeCommand = (userName) => console.log(`Thank you for using File Manager, ${ userName }, goodbye!`);

const printCurrentWorkingDirectory = () => console.log(`You are currently in: ${ cwd() }`);

const executeCommand = async (command) => {
    try {
        await command();
    } catch (e) {
        if (e.code || e.name === 'OperationFailedError') {
            throw new OperationFailedError();
        } else {
            throw new InvalidInputError();
        }

    }
};

export { executeCommand, handleMainCommand, sayHiCommand, sayByeCommand, printCurrentWorkingDirectory };