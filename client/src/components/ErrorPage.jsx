import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <main className='d-flex justify-content-center align-items-center'>
      <div>
        <h2>An error occurred</h2>
        <Link to='/'>Click here to to the global chat</Link>
      </div>
    </main>
  );
}
