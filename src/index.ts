import { ChildProcess, exec } from 'child_process';
import { fatal, warn } from './util';

let blender: ChildProcess;
export function startBlender(path: string) {
    blender = exec(`${JSON.stringify(path)} --python-console`);
    blender.on('exit', e => {
        fatal('Blender exited with code %s', e);
    })
    blender.stdin.write(`import bpy\n`);
    blender.stdin.write(`C = byp.context\n`);
}

export function select_all(action: 'SELECT' | 'DESELECT') {
    blender.stdin.write(`bpy.ops.object.select_all(action='${action}')\n`);
}
export function delete_selection() {
    blender.stdin.write(`bpy.ops.object.delete()\n`);
}
export function export_to(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj', file: string) {
    if (format == 'dae')
        blender.stdin.write(`bpy.ops.wm.collada_export(filepath=${JSON.stringify(file)})\n`);
    else if (['ply'].includes(format))
        blender.stdin.write(`bpy.ops.export_mesh.${format}(filepath=${JSON.stringify(file)})\n`);
    else if (['fbx', 'gltf', 'obj'].includes(format))
        blender.stdin.write(`bpy.ops.export_scene.${format}(filepath=${JSON.stringify(file)})\n`);
}
export function import_from(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj', file: string) {
    if (format == 'dae')
        blender.stdin.write(`bpy.ops.wm.collada_import(filepath=${JSON.stringify(file)})\n`);
    else if (['ply'].includes(format))
        blender.stdin.write(`bpy.ops.import_mesh.${format}(filepath=${JSON.stringify(file)})\n`);
    else if (['fbx', 'gltf', 'obj'].includes(format))
        blender.stdin.write(`bpy.ops.import_scene.${format}(filepath=${JSON.stringify(file)})\n`);
}
export function done_with_blender(bye: boolean) {
    if (bye) blender.stdin.write(`import sys;sys.exit()`);
    blender.stdin.end();
}
export async function flush() {
    return new Promise((res) => {
        let id = Math.random().toString().slice(2);
        blender.stdin.write(`print('asdf' + '${id}')\n`);
        function done_check(x: Buffer) {
            if (x.toString().includes(`asdf${id}`)) {
                res();
            }
        }
        blender.stdout.on('data', done_check);
    })
}
blender.stdout.pipe(process.stderr);
blender.stderr.pipe(process.stderr);