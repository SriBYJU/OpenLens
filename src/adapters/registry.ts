import type { AdapterManifest } from '../core/types';
import {modeledDevices} from '../data/devices';
import {capabilityKeys} from '../core/types';
export const adapterRegistry:AdapterManifest[]=[{id:'openlens-optical-twin-v2',deviceId:'openlens-twin',name:'OpenLens Optical Twin',status:'simulated',mode:'simulation',capabilities:['camera','microphone','display','audio','imu'],disclosure:'Runs deterministic browser-local fixtures. It is not a physical device connection.'}];
const modelAdapters:AdapterManifest[]=modeledDevices.map(device=>({id:`${device.id}-simulation`,deviceId:device.id,name:device.name,status:'simulated',mode:'simulation',capabilities:capabilityKeys.filter(key=>device.capabilities[key].physical==='present'),disclosure:'Capability model derived from manufacturer claims. No hardware connection, SDK emulation, or measured performance. Unavailable sensors require an explicit companion fallback.'}));
export const getAdapter=(deviceId:string)=>[...adapterRegistry,...modelAdapters].find(adapter=>adapter.deviceId===deviceId)??null;
