import { createInterface } from 'node:readline/promises';
import { cwd, chdir, stdin as input, stdout as output } from 'node:process';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpus, arch, userInfo, EOL } from 'node:os';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const greet = userName => `Welcome to the File Manager, ${ userName }!`;

const goodbye = userName => `Thank you for using File Manager, ${ userName }, goodbye!`;

const parseCommand = (line) => {
    return {
        cmd: line.trim().split(' ')?.[0] ?? '',
        args: getArgs(line),
    };
};

const getArgs = (line) => {
    const arg = line.trim().split(' ')?.[1];
    if (arg && arg.startsWith('--')) {
        return [ arg.slice(2) ];
    }
    return '';
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
        const data = files.map((file) => ({ Name: file.name, Type: file.isFile() ? 'file' : 'directory' }));
        console.table(data);
    } catch (e) {
        if (e.code === 'ENOENT') {
            throw new Error(`FS_OPERATION_FAILED`);
        }
    }
};

const onUpCommand = async () => {
    try {
        chdir('..');
    } catch (e) {
        if (e.code === 'ENOENT') {
            throw new Error(`FS_OPERATION_FAILED`);
        }
    }
};

const onOsCommand = async ([args]) => {
    const actions = {
        'EOL': () => console.log(JSON.stringify(EOL)),
        'cpus': () => console.table(
            cpus().map(cpu => ({
                Model: cpu.model,
                Speed: cpu.speed,
                // times_user: cpu.times.user,
                // times_nice: cpu.times.nice,
                // times_sys: cpu.times.sys,
                // times_idle: cpu.times.idle,
                // times_irq: cpu.times.irq,
            }))),
        'homedir': () => console.log(homedir()),
        'username': () => console.log(userInfo({ encoding: 'utf-8' })),
        'architecture': () => console.log(arch())
    };
    try {
        await actions[args]();
    } catch (e) {
        throw new Error('Operation failed');
    }
};

const handleCommand = async (line) => {
    const { cmd, args } = parseCommand(line);
    console.log(args);
    const actions = {
        'ls': () => onLsCommand(cwd()),
        'up': () => onUpCommand(),
        'cd': () => console.log(line),
        'cat': () => console.log(line),
        'add': () => console.log(line),
        'rn': () => console.log(line),
        'cp': () => console.log(line),
        'mv': () => console.log(line),
        'rm': () => console.log(line),
        'os': () => onOsCommand(args),
        'hash': () => console.log(line),
        'compress': () => console.log(line),
        'decompress': () => console.log(line),
    };

    try {
        await actions[cmd]();
    } catch (e) {
        throw new Error('Operation failed');
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
        // rl.question('What is your favorite food? ', (answer) => {
        //     console.log(`Oh, so your favorite food is ${answer}`);
        // });

        rl.prompt();
        rl.on('pause', () => {
            console.log(`paused`);
        });
        // console.log(`You are currently in ${ homedir() }`);
        // console.log(`You are currently in ${ __dirname }`);

        rl.on('line', (line) => {
            handleCommand(line)
                .then((action) => {

                })
                .catch(e => console.log(e.message))
                .finally(() => {
                    console.log(`You are currently in: ${ cwd() }`);
                    rl.prompt();
                });
        });

        rl.on('SIGINT', async () => {
            console.log(goodbye(getUserName()));
            rl.close();

            // await rl.question('Are you sure you want to exit? ', (answer) => {
            //     if (answer.match(/^y(es)?$/i)) {
            //         // rl.pause();
            //         rl.close();
            //     }
            // });
        });
    } catch (e) {
        console.log(e);
    }
};

start();