import { delete_selection, select_all, import_from_format, export_to_format, done_with_blender } from './iface';

select_all('SELECT');
delete_selection();
import_from_format('dae', 'C:\\Users\\USER\\Downloads\\x\\8bit_geo.xml');
export_to_format('gltf', 'x.glb');
export_to_format('dae', 'x.dae');
export_to_format('ply', 'x.ply');
export_to_format('fbx', 'x.fbx');
export_to_format('obj', 'x.obj');
done_with_blender(true);