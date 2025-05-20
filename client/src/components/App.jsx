import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import LogIn from './LogIn';
import SignUp from './SignUp';
import NotFound from './NotFound';
import { AuthProvider } from '../context/authContext.jsx';
import GroupChat from './chat/GroupChat.jsx';
import PrivateChat from './chat/PrivateChat.jsx';
import { ChatsProvider } from '../context/chatsContext.jsx';
import EditProfile from './EditProfile.jsx';
import MainMenu from './main-menu/MainMenu.jsx';
import ErrorPage from './ErrorPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/chats/group/global-chat' />,
    errorElement: <ErrorPage />,
  },
  { path: '/menu', element: <MainMenu />, errorElement: <ErrorPage /> },
  {
    path: '/chats/group/:chatId',
    element: <GroupChat />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/chats/private/:recipientId',
    element: <PrivateChat />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/log-in',
    element: <LogIn />,
    errorElement: <ErrorPage />,
  },
  { path: '/sign-up', element: <SignUp />, errorElement: <ErrorPage /> },
  { path: '/edit-profile', element: <EditProfile /> },
  { path: '*', element: <NotFound />, errorElement: <ErrorPage /> },
]);

function App() {
  return (
    <AuthProvider>
      <ChatsProvider>
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
      </ChatsProvider>
    </AuthProvider>
  );
}

export default App;
