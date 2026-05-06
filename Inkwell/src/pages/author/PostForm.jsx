import { useParams } from 'react-router-dom';
import CreatePost from '../CreatePost.jsx';
import EditPost from '../EditPost.jsx';

export default function AuthorPostFormRoute() {
  const { id } = useParams();
  return id ? <EditPost /> : <CreatePost />;
}
