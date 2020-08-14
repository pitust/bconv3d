export function log(msg: string, ...args: any[]) {
    console.log(`\x1b[33;1mINFO\x1b[0m ${msg}`, ...args);
}
export function warn(msg: string, ...args: any[]) {
    console.log(`\x1b[32;1mWARN\x1b[0m ${msg}`, ...args);
}
export function fatal(msg: string, ...args: any[]) {
    console.log(`\x1b[31;1mFATAL\x1b[0m ${msg}`, ...args);
    process.exit(1);
}