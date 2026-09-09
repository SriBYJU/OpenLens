import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {benchmark,compileExperience,defaultSimulationConfig,experiencePresets,getDevice,simulate,type BenchmarkResult,type CompiledPlan,type ExperienceDefinition,type RunResult,type SimulationConfig} from '../core';
import {validateDeviceId} from '../data/devices';

interface Workbench {deviceId:string;setDeviceId:(id:string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
const Context=createContext<Workbench|null>(null);
const readExperience=()=>{try{const saved=localStorage.getItem('openlens.experience');return saved?JSON.parse(saved) as ExperienceDefinition:experiencePresets[0]}catch{return experiencePresets[0]}};

export function WorkbenchProvider({initialDevice,children}:{initialDevice?:string|null;children:ReactNode}){
 const [deviceId,setDeviceState]=useState(()=>validateDeviceId(initialDevice??localStorage.getItem('openlens.device')));
 const [experience,setExperienceState]=useState<ExperienceDefinition>(readExperience);
 const [config,setConfigState]=useState(defaultSimulationConfig);
 const [run,setRun]=useState<RunResult|null>(null);
 const [runHistory,setRunHistory]=useState<RunResult[]>([]);
 const [benchmarkResult,setBenchmark]=useState<BenchmarkResult|null>(null);
 useEffect(()=>{if(initialDevice)setDeviceState(validateDeviceId(initialDevice))},[initialDevice]);
 const setDeviceId=(id:string)=>{const safe=validateDeviceId(id);setDeviceState(safe);localStorage.setItem('openlens.device',safe);setRun(null);setBenchmark(null)};
 const setExperience=(value:ExperienceDefinition)=>{setExperienceState(value);localStorage.setItem('openlens.experience',JSON.stringify(value));setRun(null);setBenchmark(null)};
 const setConfig=(value:SimulationConfig)=>{setConfigState(value);setRun(null);setBenchmark(null)};
 const plan=useMemo(()=>compileExperience(experience,getDevice(deviceId)),[deviceId,experience]);
 const runCurrent=()=>{const next=simulate(plan,config);setRun(next);setRunHistory(current=>[next,...current.filter(item=>item.id!==next.id)].slice(0,8));return next};
 const benchmarkCurrent=(trials:number)=>{const next=benchmark(plan,config,trials);setBenchmark(next);return next};
 const clearArtifact=()=>{setRun(null);setBenchmark(null)};
 return <Context.Provider value={{deviceId,setDeviceId,experience,setExperience,config,setConfig,plan,run,runHistory,runCurrent,benchmarkResult,benchmarkCurrent,clearArtifact}}>{children}</Context.Provider>;
}
export function useWorkbench(){const value=useContext(Context);if(!value)throw new Error('Workbench context missing.');return value}
