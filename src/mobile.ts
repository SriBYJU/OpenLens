import {useEffect,useState} from 'react';
export function useMobile(){const [mobile,setMobile]=useState(()=>matchMedia('(max-width: 760px)').matches);useEffect(()=>{const m=matchMedia('(max-width: 760px)');const update=()=>setMobile(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);return mobile;}
