import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main>
      <h2>Page not found</h2>
      <Link to='/chat/global-chat'>Go to the global chat</Link>
    </main>
  );
}
