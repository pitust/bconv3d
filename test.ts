import * as bconv3d from './src/index';
import { pyRoots, init } from './src/pyfi';

(async () => {
    bconv3d.startBlender('blender');
    await init();
    await bconv3d.select_all('SELECT');
    await bconv3d.delete_selection();
    while (1);
})()