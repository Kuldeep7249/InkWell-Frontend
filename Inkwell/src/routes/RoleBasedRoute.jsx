import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
export default function RoleBasedRoute({roles=[]}){ const {user}=useAuth(); if(!user) return <Navigate to='/login' replace/>; return roles.includes(user.role)?<Outlet/>:<Navigate to='/access-denied' replace/>; }
