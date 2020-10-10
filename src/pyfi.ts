import { readFile, appendFile, unlink } from "fs/promises";
import { ChildProcess, exec } from "child_process";
import { fatal } from "./util";
import { type } from "os";
let blender: ChildProcess;
const DEBUG = false;
function startBlender(path: string) {
    blender = exec(`${JSON.stringify(path)} --python-console`);
    blender.on('exit', e => {
        fatal('Blender exited with code %s', e);
    })
    blender.stdin.write(`import bpy\n`);
    blender.stdin.write(`import mathutils\n`);
    blender.stdin.write(`C = bpy.context\n`);
    blender.stdout.setMaxListeners(65536);
    blender.stderr.pipe(process.stdout);
    blender.stderr.on('data', async (x: Buffer) => {
        if (DEBUG) await appendFile('stuff.txt', '\n' + x.toString());
    })
}
async function __runpyfi(code: string) {
    blender.stdin.write(`${code}\n`);
    if (DEBUG) await appendFile('stuff.txt', '\n' + code);
    await flush();
}
export async function flush() {
    return new Promise(async (res) => {
        let id = Math.random().toString().slice(2);
        async function done_check(x: Buffer) {
            if (x.toString().includes(`asdf${id}`)) {
                blender.stdout.off('data', done_check);
                res();
            }
        }
        blender.stdout.on('data', done_check);
        blender.stdin.write(`print('asdf' + '${id}')\n`);
    })
}

let table = new Map<any, number>();
let inc = 2;
function id() {
    __runpyfi('pyfiObject.append(None)\n');
    return inc++;
}
async function sendVal(s: any) {
    // None in python
    if (s == null || s == undefined) return 1;
    if (table.has(s)) return table.get(s);
    if (typeof s == 'boolean') {
        let i = id();
        await __runpyfi(`pyfiObject[${i}] = True if 1 == ${+s} else False\n`);
        return i;
    }
    if (typeof s == 'object') {
        if (s instanceof Array) {
            let i = id();
            await __runpyfi(`pyfiObject[${i}] = []\n`);
            for (let e of s) {
                await __runpyfi(`pyfiObject[${i}].append(pyfiObject[${await sendVal(await e)}])\n`);
            }
            return i;
        }
        let i = id();
        await __runpyfi(`pyfiObject[${i}] = {}\n`);
        for (let e of Object.getOwnPropertyNames(s)) {
            await __runpyfi(`pyfiObject[${i}][${JSON.stringify(e)}] = pyfiObject[${await sendVal(s[e])}]`);
        }
        return i;
    }
    if (typeof s == 'number' || typeof s == 'string') {
        let i = id();
        await __runpyfi(`pyfiObject[${i}] = ${JSON.stringify(s)}\n`);
        return i;
    }
    console.error('Sendval failed for ', s);
    throw new Error('Cannot sendVal() this value');
}
function forId(i: number, key: string): any {
    async function applyImpl(leet: any, args: any[]) {
        let i2 = id();
        let i3 = id();
        let i4 = table.get(leet);
        if (typeof args[args.length - 1] == 'object' && !table.has(args[args.length - 1]) && !(args[args.length - 1] instanceof Array)) {
            // that has kvargs
            await __runpyfi(`pyfiObject[${i2}] = []\n`);
            for (let a of args.slice(0, -1)) {
                let i5 = await sendVal(a);
                await __runpyfi(`pyfiObject[${i2}].append(pyfiObject[${i5}])\n`);
            }
            let i6 = await sendVal(args[args.length - 1]);
            await __runpyfi(`pyfiObject[${i6}] = pyfiObject[${i4}].${key}(*pyfiObject[${i2}], **pyfiObject[${i6}])`);
            return forId(i6, '__pyfi_bad_key');
        } else {
            await __runpyfi(`pyfiObject[${i2}] = []\n`);
            for (let a of args) {
                let i5 = await sendVal(a);
                await __runpyfi(`pyfiObject[${i2}].append(pyfiObject[${i5}])\n`);
            }
            await __runpyfi(`pyfiObject[${i3}] = pyfiObject[${i4}].${key}(*pyfiObject[${i2}])`);
            return forId(i3, '__pyfi_bad_key');
        }
    }
    let p = new Proxy(() => { }, {
        has(_, p) {
            if (p == 'then') return false;
            if (p == Symbol.iterator) return false;
            return true;
        },
        get(_, p) {
            if (typeof p == 'number') {
                let i2 = id();
                __runpyfi(`pyfiObject[${i2}] = pyfiObject[${i}][${p}]`);
                return forId(i2, '__pyfi_bad_key');
            }
            if (p == 'then') return undefined;
            if (p == 'pyfiGetDictValue') {
                return async (key: string) => {
                    let i2 = id();
                    __runpyfi(`pyfiObject[${i2}] = pyfiObject[${i}][pyfiObject[${await sendVal(key)}]]`);
                    return forId(i2, p as string);
                }
            }
            if (p == Symbol.iterator) return undefined;
            if (p == Symbol.asyncIterator) {
                return (async () => {
                    let i2 = id();
                    let i3 = id();
                    await __runpyfi(`pyfiObject[${i2}] = iter(${i})`);
                    return {
                        async next() {
                            let i4 = id();
                            await __runpyfi(`pyfiObject[${i4}] = next(pyfiObject[${i2}], sentinel)`)
                            await __runpyfi(`pyfiObject[${i3}] = pyfiObject[${i4}] == sentinel`);
                            if (forId(i3, '__pyfi_bad_key').value()) {
                                return { done: true, value: undefined };
                            }
                            return { done: false, value: forId(i4, '__pyfi_bad_key') };
                        },
                        async return() { return this.next(); }
                    } as AsyncIterator<any>
                })();
            }
            if (p == 'value') return async () => {
                await __runpyfi(`f = open('dump', 'w')\n`)
                await __runpyfi(`f.write(json.dumps(pyfiObject[${i}]))\n`);
                await __runpyfi(`f.close()\n`);
                let d = JSON.parse(await readFile('dump', { encoding: 'utf-8' }));
                await unlink('dump');
                return d;
            }
            let i2 = id();
            __runpyfi(`pyfiObject[${i2}] = pyfiObject[${i}].${p as string}`);
            return forId(i2, p as string);
        },
        set(_, p, v) {
            (async () => {
                let i2 = await sendVal(v);
                await __runpyfi(`pyfiObject[${i}].${p as string} = pyfiObject[${i2}]`);
            })();
            return true;
        },
        apply(_, t, a) {
            return applyImpl(t, a);
        }
    })
    table.set(p, i);
    return p;
}
export async function init() {
    startBlender('blender');
    await __runpyfi('import json');
    await __runpyfi(`class PyRoots:
      def __init__(self):
        self.bpy = bpy
        self.mathutils = mathutils
`);
    await __runpyfi('pyRoots = PyRoots()');
    await __runpyfi('sentinel = object()');
    await __runpyfi('pyfiObject = [pyRoots, None]');
    await pyRoots.bpy.ops.object.select_all({ action: 'DESELECT' });
    await pyRoots.bpy.context.scene.camera.select_set(true);
    await pyRoots.bpy.ops.object.delete();
}
export async function import_python(mod: string) {
    let i = id();
    await __runpyfi('import ' + mod + ' as __pyfi_mod_' + i);
    await __runpyfi(`pyRoots.${mod} = __pyfi_mod_${i}`);
}
export const pyRoots = forId(0, 'pyRoots');
export const None = forId(1, 'None');
export async function iter2arr(iter: AsyncIterable<AsyncIterator<any>>): Promise<any[]> {
    let a = [];
    for await (let e of iter) a.push(e);
    return a;
}