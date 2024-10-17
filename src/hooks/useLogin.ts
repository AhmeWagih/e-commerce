import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { actAuthLogin, resetUI } from '@store/auth/authSlice';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginType } from '@validations/LoginSchema';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, accessToken } = useAppSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginType>({
    mode: 'onBlur',
    resolver: zodResolver(LoginSchema),
  });

  const submitForm: SubmitHandler<LoginType> = (data) => {
    dispatch(actAuthLogin(data))
      .unwrap()
      .then(() => {
        localStorage.setItem('loginSuccess', 'true'); // Set the flag
        navigate('/');
      });
  };

  useEffect(() => {
    const isRegistrationSuccess = localStorage.getItem('registrationSuccess');
    if (isRegistrationSuccess) {
      toast.success('Registration successful!');
      localStorage.removeItem('registrationSuccess'); // Clear the flag
    }
    return () => {
      dispatch(resetUI());
    };
  }, [dispatch]);
  return {
    loading,
    error,
    submitForm,
    formErrors,
    accessToken,
    register,
    handleSubmit,
  };
};

export default useLogin;
