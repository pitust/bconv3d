import { pyRoots, flush } from './pyfi';
import { execSync } from 'child_process';
import { unlinkSync, renameSync, copyFileSync } from 'fs';

export async function select_all(action: 'SELECT' | 'DESELECT') {
    await pyRoots.bpy.ops.object.select_all({ action });
}
export async function delete_selection() {
    await pyRoots.bpy.ops.object.delete();
}
export async function export_to(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj' | 'x3d' | 'stl' | 'blend' | 'alembic' | 'scw', file: string) {
    if (format == 'dae')
        await pyRoots.bpy.ops.wm.collada_export({ filepath: file });
    else if (['ply', 'stl'].includes(format))
        await pyRoots.bpy.ops.export_mesh.ply({ filepath: file });
    else if (['fbx', 'gltf', 'obj', 'x3d'].includes(format))
        await pyRoots.bpy.ops.export_scene[format]({ filepath: file });
    else if (format == 'alembic')
        await pyRoots.bpy.ops.wm.alembic_export({ filepath: file });
    else if (format == 'blend')
        await pyRoots.bpy.ops.wm.save_as_mainfile({ filepath: file });
    else if (format == 'scw') {
        await pyRoots.bpy.ops.wm.collada_export({ filepath: 'tmp.dae' });
        execSync(`java --enable-preview -jar "${require.resolve('../SCW.jar')}" dae2scw tmp.dae`);
        renameSync('tmp.scw', file);
        unlinkSync('tmp.dae');
    }
}
export async function import_from(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj' | 'x3d' | 'stl' | 'blend' | 'alembic' | 'scw', file: string) {
    if (format == 'dae')
        await pyRoots.bpy.ops.wm.collada_import({ filepath: file });
    else if (['ply', 'stl'].includes(format))
        await pyRoots.bpy.ops.import_mesh.ply({ filepath: file });
    else if (['fbx', 'gltf', 'obj', 'x3d'].includes(format))
        await pyRoots.bpy.ops.import_scene[format]({ filepath: file });
    else if (format == 'alembic')
        await pyRoots.bpy.ops.wm.alembic_import({ filepath: file });
    else if (format == 'blend')
        await pyRoots.bpy.ops.wm.open_mainfile({ filepath: file });
    else if (format == 'scw') {
        copyFileSync(file, 'tmp.scw');
        execSync(`java --enable-preview -jar "${require.resolve('../SCW.jar')}" scw2dae tmp.dae`);
        await pyRoots.bpy.ops.wm.collada_import({ filepath: 'tmp.dae' });
        unlinkSync('tmp.dae');
        unlinkSync('tmp.scw');
    }
}
export async function render(file: string) {
    let cam1 = await pyRoots.bpy.data.cameras.new("RenderingCam")
    cam1.lens = 18

    // create the first camera object
    let cam_obj1 = await pyRoots.bpy.data.objects.new("RenderingCam", cam1)
    cam_obj1.location = await pyRoots.mathutils.Vector([0, 5, 0]);
    cam_obj1.rotation_euler = await pyRoots.mathutils.Euler(await pyRoots.mathutils.Vector([-90 / 180 * Math.PI, 0, 0]));
    pyRoots.bpy.context.scene.camera = cam_obj1;
    await flush();
    await pyRoots.bpy.context.scene.collection.objects.link(cam_obj1)
    await pyRoots.bpy.ops.render.render();
    await select_all('DESELECT');
    await cam_obj1.select_set(true);
    await delete_selection();
    await (await pyRoots.bpy.data.images.pyfiGetDictValue('Render Result')).save_render({ filepath: file });
}
