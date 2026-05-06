const ACCESS='inkwell_access_token';
const REFRESH='inkwell_refresh_token';
const USER='inkwell_user';
export const tokenStorage={
  getAccess:()=>localStorage.getItem(ACCESS),
  getRefresh:()=>localStorage.getItem(REFRESH),
  set:(auth)=>{ localStorage.setItem(ACCESS,auth.accessToken); if(auth.refreshToken) localStorage.setItem(REFRESH,auth.refreshToken); localStorage.setItem(USER,JSON.stringify({userId:auth.userId,username:auth.username,email:auth.email,role:auth.role})); },
  user:()=>{try{return JSON.parse(localStorage.getItem(USER)||'null')}catch{return null}},
  setUser:(u)=>localStorage.setItem(USER,JSON.stringify(u)),
  clear:()=>{localStorage.removeItem(ACCESS);localStorage.removeItem(REFRESH);localStorage.removeItem(USER)}
};
