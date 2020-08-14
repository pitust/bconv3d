# bconv3d
Convert stuff with blender.
## Examples
```typescript
import { startBlender, flush, select_all, delete_selection, export_to, import_from } from 'bconv3d';
(async () => {
    startBlender('C:\\path\\to\\blender\\blender.exe');
    select_all('SELECT');
    delete_selection();
    import_from('obj', 'x.obj');
    export_to('gltf', 'x.glb');
    await flush();
    process.exit();
})();
```