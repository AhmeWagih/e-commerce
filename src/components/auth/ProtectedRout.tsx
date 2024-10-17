import { useAppSelector } from '@store/hooks';
import { Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ProtectedRout = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAppSelector((state) => state.auth);
  if (!accessToken) {
    toast.error('You Must Login First');
    return <Navigate to="/login" />;
  }

  return (
    <>
      {' '}
      <ToastContainer />
      {children}
    </>
  );
};

export default ProtectedRout;
