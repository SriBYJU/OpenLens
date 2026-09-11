import {compileExperience,defaultSimulationConfig,DigitalTwinAdapter,experiencePresets,getDevice} from '../core';
import {createOpenLens} from '../sdk';

/** A runnable, network-free SDK example using the deterministic reference twin. */
export async function runOpenLensSDKExample(){
 const device=getDevice('openlens-twin');
 const plan=compileExperience(experiencePresets[0],device);
 const openlens=createOpenLens(new DigitalTwinAdapter(device));
 await openlens.device.connect();
 try{return await openlens.device.execute(plan,defaultSimulationConfig)}
 finally{await openlens.device.disconnect()}
}
