import { createContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '../api/authApi.js';
import { tokenStorage } from '../utils/tokenStorage.js';
import { unwrap } from '../utils/helpers.js';

export const AuthContext=createContext(null);

export function AuthProvider({children}){
  const [user,setUser]=useState(tokenStorage.user());
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(tokenStorage.getAccess()){
      authApi.profile().then(r=>{
        const p=unwrap(r);
        setUser(p);
        tokenStorage.setUser(p);
      }).catch(()=>{});
    }
  },[]);

  const login=async(data)=>{
    setLoading(true);
    try{
      const auth=unwrap(await authApi.login(data));
      tokenStorage.set(auth);
      setUser({userId:auth.userId, username:auth.username, email:auth.email, role:auth.role});
      toast.success('Logged in successfully');
      return auth;
    } finally { setLoading(false); }
  };

  const requestLoginOtp=async(data)=>{
    setLoading(true);
    try{
      return unwrap(await authApi.requestLoginOtp(data));
    } finally { setLoading(false); }
  };

  const verifyLoginOtp=async(data)=>{
    setLoading(true);
    try{
      const auth=unwrap(await authApi.verifyLoginOtp(data));
      tokenStorage.set(auth);
      setUser({userId:auth.userId, username:auth.username, email:auth.email, role:auth.role});
      toast.success('Logged in successfully');
      return auth;
    } finally { setLoading(false); }
  };

  const register=async(data)=>{
    const auth=unwrap(await authApi.register(data));
    tokenStorage.set(auth);
    setUser({userId:auth.userId, username:auth.username, email:auth.email, role:auth.role});
    toast.success('Account created successfully');
    return auth;
  };

  const logout=async()=>{
    try{ const refreshToken=tokenStorage.getRefresh(); if(refreshToken) await authApi.logout(refreshToken); }catch{}
    tokenStorage.clear();
    setUser(null);
    location.href='/login';
  };

  const value=useMemo(()=>({user,setUser,loading,login,requestLoginOtp,verifyLoginOtp,register,logout,isAuthenticated:!!user}),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
