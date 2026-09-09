import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {benchmark,compileExperience,defaultSimulationConfig,experiencePresets,getDevice,simulate,validateExperience,type BenchmarkResult,type CompiledPlan,type ExperienceDefinition,type RunResult,type SimulationConfig} from '../core';
import {validateDeviceId} from '../data/devices';

interface Workbench {deviceId:string;setDeviceId:(id:string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
const Context=createContext<Workbench|null>(null);
const readStorage=(key:string)=>{try{return localStorage.getItem(key)}catch{return null}};
const writeStorage=(key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{/* Continue in memory when browser storage is unavailable. */}};
const readExperience=()=>{try{const saved=readStorage('openlens.experience');return saved?validateExperience(JSON.parse(saved)):experiencePresets[0]}catch{return experiencePresets[0]}};

export function WorkbenchProvider({initialDevice,children}:{initialDevice?:string|null;children:ReactNode}){
 const [deviceId,setDeviceState]=useState(()=>validateDeviceId(initialDevice??readStorage('openlens.device')));
 const [experience,setExperienceState]=useState<ExperienceDefinition>(readExperience);
 const [config,setConfigState]=useState(defaultSimulationConfig);
 const [run,setRun]=useState<RunResult|null>(null);
 const [runHistory,setRunHistory]=useState<RunResult[]>([]);
 const [benchmarkResult,setBenchmark]=useState<BenchmarkResult|null>(null);
 useEffect(()=>{if(initialDevice){setDeviceState(validateDeviceId(initialDevice));setRun(null);setBenchmark(null)}},[initialDevice]);
 const setDeviceId=(id:string)=>{const safe=validateDeviceId(id);setDeviceState(safe);writeStorage('openlens.device',safe);setRun(null);setBenchmark(null)};
 const setExperience=(value:ExperienceDefinition)=>{setExperienceState(value);writeStorage('openlens.experience',JSON.stringify(value));setConfigState(current=>({...current,fixture:value.input==='microphone'?'conversation':value.task==='describe'?'museum-label':'street-sign'}));setRun(null);setBenchmark(null)};
 const setConfig=(value:SimulationConfig)=>{setConfigState(value);setRun(null);setBenchmark(null)};
 const plan=useMemo(()=>compileExperience(experience,getDevice(deviceId)),[deviceId,experience]);
 const runCurrent=()=>{const next=simulate(plan,config);setRun(next);setRunHistory(current=>[next,...current.filter(item=>JSON.stringify(item)!==JSON.stringify(next))].slice(0,8));return next};
 const benchmarkCurrent=(trials:number)=>{const next=benchmark(plan,config,trials);setBenchmark(next);return next};
 const clearArtifact=()=>{setRun(null);setBenchmark(null)};
 return <Context.Provider value={{deviceId,setDeviceId,experience,setExperience,config,setConfig,plan,run,runHistory,runCurrent,benchmarkResult,benchmarkCurrent,clearArtifact}}>{children}</Context.Provider>;
}
export function useWorkbench(){const value=useContext(Context);if(!value)throw new Error('Workbench context missing.');return value}
