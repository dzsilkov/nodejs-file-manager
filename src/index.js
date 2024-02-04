import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output, exit } from 'node:process';
import { homedir } from 'node:os';
import {
    executeCommand,
    handleMainCommand,
    sayHiCommand,
    sayByeCommand,
    printCurrentWorkingDirectory
} from './commands/commands.js';
import { getUserName } from './helpers/helpers.js';
import { onCdCommand } from './commands/nwd/nwd.js';


const fileManagerStart = () => {
    try {
        const rl = createInterface({
            input,
            output,
        });

        sayHiCommand(getUserName());

        onCdCommand([ homedir() ]);

        printCurrentWorkingDirectory();

        rl.prompt();

        rl.on('line', (line) => {
            executeCommand(handleMainCommand(line))
                .catch(e => console.log(e.message))
                .finally(() => {
                    printCurrentWorkingDirectory();
                    rl.prompt();
                });
        });

        rl.on('close', () => {
            process.exit();
        });
        process.on('exit', (code) => {
            sayByeCommand(getUserName());
        });
    } catch (e) {
        // console.log(e);
    }
};

fileManagerStart();