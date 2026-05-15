const ACCESS='inkwell_access_token';
const REFRESH='inkwell_refresh_token';
const USER='inkwell_user';
const LEGACY_ACCESS='token';
export const tokenStorage={
  getAccess:()=>localStorage.getItem(ACCESS) || localStorage.getItem(LEGACY_ACCESS),
  getRefresh:()=>localStorage.getItem(REFRESH),
  set:(auth)=>{ localStorage.setItem(ACCESS,auth.accessToken); localStorage.setItem(LEGACY_ACCESS,auth.accessToken); if(auth.refreshToken) localStorage.setItem(REFRESH,auth.refreshToken); localStorage.setItem(USER,JSON.stringify({userId:auth.userId,username:auth.username,email:auth.email,role:auth.role})); },
  setAccessToken:(token)=>{ localStorage.setItem(ACCESS,token); localStorage.setItem(LEGACY_ACCESS,token); localStorage.removeItem(REFRESH); localStorage.removeItem(USER); },
  user:()=>{try{return JSON.parse(localStorage.getItem(USER)||'null')}catch{return null}},
  setUser:(u)=>localStorage.setItem(USER,JSON.stringify(u)),
  clear:()=>{localStorage.removeItem(ACCESS);localStorage.removeItem(LEGACY_ACCESS);localStorage.removeItem(REFRESH);localStorage.removeItem(USER)}
};
