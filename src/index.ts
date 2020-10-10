export * from './pyfi';
export * from './apyfi';
import fetch from 'node-fetch';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
let ver = JSON.parse(readFileSync(require.resolve('../package.json')).toString()).version;
fetch('https://registry.npmjs.com/bconv3d').then(e => e.json()).then(c => {
    if (c['dist-tags'].latest != ver && !existsSync(require.resolve('../package.json') + '/../.git')) {
        console.log('\x1b[33m[bconv3d] An update is available (auto-installing)\x1b[0m');
        exec('npm i bconv3d', { cwd: require.resolve('../../..') }).on('exit', () => {
            console.log('\x1b[33m[bconv3d] Update installed!\x1b[0m');
        });
    }
})