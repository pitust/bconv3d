import { pyRoots, flush } from './pyfi';

export async function select_all(action: 'SELECT' | 'DESELECT') {
    await pyRoots.bpy.ops.object.select_all({ action });
}
export async function delete_selection() {
    await pyRoots.bpy.ops.object.delete();
}
export async function export_to(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj' | 'x3d' | 'stl' | 'blend' | 'alembic', file: string) {
    if (format == 'dae')
        pyRoots.bpy.ops.wm.collada_export({ filepath: file });
    else if (['ply', 'stl'].includes(format))
        pyRoots.bpy.ops.export_mesh.ply({ filepath: file });
    else if (['fbx', 'gltf', 'obj', 'x3d'].includes(format))
        pyRoots.bpy.ops.export_scene[format]({ filepath: file });
    else if (format == 'alembic')
        pyRoots.bpy.ops.wm.alembic_export({ filepath: file });
    else if (format == 'blend')
        pyRoots.bpy.ops.wm.save_as_mainfile({ filepath: file });
}
export async function import_from(format: 'dae' | 'ply' | 'fbx' | 'gltf' | 'obj' | 'x3d' | 'stl' | 'blend' | 'alembic', file: string) {
    if (format == 'dae')
        pyRoots.bpy.ops.wm.collada_import({ filepath: file });
    else if (['ply', 'stl'].includes(format))
        pyRoots.bpy.ops.import_mesh.ply({ filepath: file });
    else if (['fbx', 'gltf', 'obj', 'x3d'].includes(format))
        pyRoots.bpy.ops.import_scene[format]({ filepath: file });
    else if (format == 'alembic')
        pyRoots.bpy.ops.wm.alembic_import({ filepath: file });
    else if (format == 'blend')
        pyRoots.bpy.ops.wm.open_mainfile({ filepath: file });
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
