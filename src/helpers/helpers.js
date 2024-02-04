const parseCommand = (line) => {
    const [ cmd, ...args ] = line.trim().split(' ');

    return {
        cmd,
        args: parseArgs(args),
    };
};

const parseArgs = (args) => {
    if (!args || !args.length) {
        return [];
    }
    let [ firstArg, secondArg ] = args;

    if (firstArg && firstArg.startsWith('--')) {
        return [ firstArg.slice(2) ];
    }
    const singleQuotesIncl = args.some(item => item.includes('\''));
    const doubleQuotesIncl = args.some(item => item.includes('"'));

    if (doubleQuotesIncl || singleQuotesIncl) {
        const separator = singleQuotesIncl && !doubleQuotesIncl ? '\'' : '"';
        args = args
            .join(' ')
            .split(separator)
            .filter(item => item.length > 2);
        [ firstArg, secondArg ] = args;
    }

    if (firstArg && !secondArg) {
        return [ firstArg ];
    }
    if (firstArg && secondArg) {
        return [ firstArg, secondArg ];
    }
};

const getUserName = () => {
    const defaultUserName = 'Guest';
    return process.argv
        .find(arg => arg.startsWith('--username='))
        ?.split('=')[1] ?? defaultUserName;
};

export {
    getUserName,
    parseCommand
};