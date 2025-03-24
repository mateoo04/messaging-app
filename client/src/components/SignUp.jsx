import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext.jsx';

const createUserSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Display name must be at least 2 characters long'),
    username: z.string().min(2, 'Username must be at least 2 characters long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
  })
  .superRefine(({ password, confirmPassword }, cxt) => {
    if (confirmPassword != password) {
      cxt.addIssue({ message: 'The passwords do not match' });
    }
  });

export default function SignUp() {
  const { logIn } = useAuth();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createUserSchema) });

  const handleSignUp = async (data) => {
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to sign up');

      logIn();
      navigate('/chat');
    } catch {
      toast.error('Failed to sign up');
    }
  };

  return (
    <>
      <main className='flex-grow-1 d-flex flex-column justify-content-center align-items-center'>
        {Object.values(errors).length ? (
          <div className='bg-warning rounded-4 p-3 mb-3'>
            <ul className='ps-3 mb-0'>
              {Object.values(errors).map((error) => {
                return <li>{error.message}</li>;
              })}
            </ul>
          </div>
        ) : (
          ''
        )}
        <form
          onSubmit={handleSubmit(handleSignUp)}
          className='d-flex flex-column align-items-center mb-4'
        >
          <label htmlFor='displayName'>
            Display name
            <input
              type='text'
              name='displayName'
              {...register('displayName')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='username'>
            Username
            <input
              type='text'
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
          <label htmlFor='confirmPassword'>
            Confirm password
            <input
              type='password'
              name='confirmPassword'
              {...register('confirmPassword')}
              className='form-control mb-3'
            />
          </label>
          <button type='submits' className='btn bg-primary text-white'>
            Sign up
          </button>
        </form>
        <p className='text-center'>
          Already a user? <Link to='/log-in'>Log in here</Link>
        </p>
      </main>
    </>
  );
}
