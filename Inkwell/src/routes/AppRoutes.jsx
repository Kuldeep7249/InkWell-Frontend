import { Route, Routes } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
import Search from '../pages/public/Search.jsx';
import PostDetail from '../pages/public/PostDetail.jsx';
import Login from '../pages/auth/Login.jsx';
import OAuthSuccess from '../pages/auth/OAuthSuccess.jsx';
import Register from '../pages/auth/Register.jsx';
import AccessDenied from '../pages/auth/AccessDenied.jsx';
import Profile from '../pages/reader/Profile.jsx';
import Notifications from '../pages/reader/Notifications.jsx';
import RoleRequests from '../pages/reader/RoleRequests.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleBasedRoute from './RoleBasedRoute.jsx';
import AuthorDashboard from '../pages/author/AuthorDashboard.jsx';
import MyPosts from '../pages/author/MyPosts.jsx';
import PostForm from '../pages/author/PostForm.jsx';
import MediaLibrary from '../pages/author/MediaLibrary.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManagePosts from '../pages/admin/ManagePosts.jsx';
import ManageCategories from '../pages/admin/ManageCategories.jsx';
import AdminNotifications from '../pages/admin/AdminNotifications.jsx';
import ManageRoleRequests from '../pages/admin/ManageRoleRequests.jsx';

export default function AppRoutes(){
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/search" element={<Search/>}/>
    <Route path="/blog/:id" element={<PostDetail/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/oauth2/success" element={<OAuthSuccess/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/access-denied" element={<AccessDenied/>}/>

    <Route element={<ProtectedRoute/>}>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/notifications" element={<Notifications/>}/>
      <Route path="/role-requests" element={<RoleRequests/>}/>
    </Route>

    <Route element={<RoleBasedRoute roles={['AUTHOR','ADMIN']}/>}>
      <Route path="/author" element={<AuthorDashboard/>}/>
      <Route path="/author/posts" element={<MyPosts/>}/>
      <Route path="/author/posts/new" element={<PostForm/>}/>
      <Route path="/author/posts/:id/edit" element={<PostForm/>}/>
      <Route path="/author/media" element={<MediaLibrary/>}/>
    </Route>

    <Route element={<RoleBasedRoute roles={['ADMIN']}/>}>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/users" element={<ManageUsers/>}/>
      <Route path="/admin/role-requests" element={<ManageRoleRequests/>}/>
      <Route path="/admin/posts" element={<ManagePosts/>}/>
      <Route path="/admin/categories" element={<ManageCategories/>}/>
      <Route path="/admin/notifications" element={<AdminNotifications/>}/>
    </Route>
  </Routes>;
}
