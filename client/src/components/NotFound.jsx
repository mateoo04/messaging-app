import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className='d-flex justify-content-center align-items-center'>
      <div>
        <h2>Page not found</h2>
        <Link to='/'>Click here to to the global chat</Link>
      </div>
    </main>
  );
}
