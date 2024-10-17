import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { RegisterSchema, RegisterType } from '@validations/RegisterSchema';
import { useNavigate } from 'react-router-dom';
import useCheckEmail from './useCheckEmail';
import { SubmitHandler, useForm } from 'react-hook-form';
import { actAuthRegister, resetUI } from '@store/auth/authSlice';
import { useEffect } from 'react';

const useRegister = () => {
  const dispatch = useAppDispatch();
  const { loading, error, accessToken } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getFieldState,
    trigger,
    formState: { errors: formErrors },
  } = useForm<RegisterType>({
    mode: 'onBlur',
    resolver: zodResolver(RegisterSchema),
  });
  const {
    emailState,
    enteredEmail,
    checkEmailAvailability,
    resetCheckEmailAvailability,
  } = useCheckEmail();

  const submitForm: SubmitHandler<RegisterType> = async (data) => {
    const { firstName, lastName, email, password } = data;
    dispatch(actAuthRegister({ firstName, lastName, email, password }))
      .unwrap()
      .then(() => {
        localStorage.setItem('registrationSuccess', 'true'); // Set the flag
        navigate('/login');
      });
  };

  const emailOnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await trigger('email');
    const value = e.target.value;
    const { isDirty, invalid } = getFieldState('email');
    if (isDirty && !invalid && enteredEmail !== value) {
      checkEmailAvailability(value);
    }
    if (isDirty && invalid && enteredEmail) {
      resetCheckEmailAvailability();
    }
  };
  useEffect(() => {
    return () => {
      resetUI();
    };
  }, [dispatch]);
  return {
    loading,
    error,
    accessToken,
    register,
    handleSubmit,
    submitForm,
    emailState,
    emailOnBlur,
    formErrors,
  };
};

export default useRegister;
