import { pyRoots } from './pyfi';

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