# bconv3d
Blender API exposed from JavaScript.
## Examples
```typescript
import { startBlender, flush, select_all, delete_selection, export_to, import_from } from 'bconv3d';
(async () => {
    startBlender('blender');
    await select_all('SELECT');
    await delete_selection();
    await import_from('obj', 'x.obj');
    await export_to('gltf', 'x.glb');
    await flush();
    process.exit();
})();
```