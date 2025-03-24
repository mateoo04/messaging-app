import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext.jsx';

const logInSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number'),
});

export default function LogIn() {
  const { logIn } = useAuth();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(logInSchema) });

  const handleLogIn = async (data) => {
    try {
      const response = await fetch('/api/auth/log-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status == 401) {
        setError('server', { message: 'Invalid credentials' });
      } else if (!response.ok) throw new Error('Failed to log in');
      else {
        logIn();
        navigate('/chat');
      }
    } catch {
      toast.error('Failed to log in');
    }
  };

  return (
    <>
      <main className='container flex-grow-1 d-flex flex-column justify-content-center align-items-center'>
        {Object.values(errors).length ? (
          <div className='bg-warning rounded-4 p-3 mb-3'>
            <ul className='ps-3 mb-0'>
              {Object.values(errors).map((error) => {
                return <li>{error.message}</li>;
              })}
            </ul>
            {}
          </div>
        ) : (
          ''
        )}
        <form
          onSubmit={handleSubmit(handleLogIn)}
          className='d-flex flex-column align-items-center mb-4'
        >
          <label htmlFor='username'>
            Username
            <input
              type='username'
              name='username'
              {...register('username')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='password'>
            Password
            <input
              type='password'
              name='password'
              {...register('password')}
              className='form-control mb-3'
            />
          </label>
          <input
            type='submit'
            value='Log in'
            className='btn bg-primary text-white'
          />
        </form>
        <p className='text-center'>
          Don't have an account yet? <Link to='/sign-up'>Sign up here</Link>
        </p>
      </main>
    </>
  );
}
