import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Heading from '@components/common/Heading/Heading';
import 'react-toastify/dist/ReactToastify.css';
const Home = () => {
  useEffect(() => {
    const isRegistrationSuccess = localStorage.getItem('loginSuccess');
    if (isRegistrationSuccess) {
      toast.success('Login successful!');
      localStorage.removeItem('loginSuccess'); // Clear the flag
    }
  }, []);
  return (
    <>
      <ToastContainer /> {/* To display toast notifications */}
      <Heading title="Home" />
    </>
  );
};

export default Home;
