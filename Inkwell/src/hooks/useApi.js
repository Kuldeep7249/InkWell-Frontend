import { useEffect, useState } from 'react';
import { unwrap } from '../utils/helpers.js';

export function useApi(fn,deps=[]){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  useEffect(()=>{
    let active=true;
    setLoading(true);
    fn().then(r=>active&&setData(unwrap(r))).catch(e=>active&&setError(e)).finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },deps);
  return {data,loading,error,setData};
}
