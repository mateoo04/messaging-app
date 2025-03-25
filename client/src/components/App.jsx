import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import Chat from './Chat';
import { Slide, ToastContainer } from 'react-toastify';
import LogIn from './LogIn';
import SignUp from './SignUp';
import NotFound from './NotFound';
import { AuthProvider } from '../context/authContext.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to='/chat/global-chat' /> },
  { path: '/chat/:recipient', element: <Chat /> },
  {
    path: '/log-in',
    element: <LogIn />,
  },
  { path: '/sign-up', element: <SignUp /> },
  { path: '*', element: <NotFound /> },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
    </AuthProvider>
  );
}

export default App;
