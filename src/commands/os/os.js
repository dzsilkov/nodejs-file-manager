import { arch, cpus, EOL, homedir, userInfo } from 'node:os';

const onOsEOLCommand = () => console.log(JSON.stringify(EOL));

const onOsHomedirCommand = () => console.log(homedir());

const onOsUserName = () => console.log(userInfo({ encoding: 'utf-8' })?.username);

const onOsArchitecture = () => console.log(arch());

const onOsCpusCommand = () => {
    const cpusData = cpus().map(({ model: Model, speed: Speed }) => ({ Model, Speed, }));
    console.table(cpusData);
};

export {
    onOsEOLCommand,
    onOsUserName,
    onOsHomedirCommand,
    onOsArchitecture,
    onOsCpusCommand
};