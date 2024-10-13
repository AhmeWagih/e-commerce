import { useState } from 'react';
import axios from 'axios';

type TStates = 'idle' | 'checking' | 'available' | 'unavailable' | 'failed';

const useCheckEmail = () => {
  const [emailState, setEmailState] = useState<TStates>('idle');
  const [enteredEmail, setEnteredEmail] = useState<null | string>(null);

  const checkEmailAvailability = async (email: string) => {
    setEnteredEmail(email);
    setEmailState('checking');
    try {
      const response = await axios.get(`/users?email=${email}`);
      if (!response.data.length) {
        setEmailState('available');
      } else {
        setEmailState('unavailable');
      }
    } catch (error) {
      setEmailState('failed');
    }
  };

  const resetCheckEmailAvailability = () => {
    setEmailState('idle');
    setEnteredEmail(null);
  };
  return {
    emailState,
    enteredEmail,
    checkEmailAvailability,
    resetCheckEmailAvailability,
  };
};

export default useCheckEmail;
