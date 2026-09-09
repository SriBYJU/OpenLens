import type { AdapterManifest } from '../core/types';
export const adapterRegistry:AdapterManifest[]=[{id:'openlens-optical-twin-v2',deviceId:'openlens-twin',name:'OpenLens Optical Twin',status:'simulated',mode:'simulation',capabilities:['camera','microphone','display','audio','imu'],disclosure:'Runs deterministic browser-local fixtures. It is not a physical device connection.'}];
export const getAdapter=(deviceId:string)=>adapterRegistry.find(adapter=>adapter.deviceId===deviceId)??null;
