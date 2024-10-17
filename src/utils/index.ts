import axios from 'axios';
export const axiosErrorHandler = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data||error.response?.data.message || error.message;
  } else {
    return 'Unexpected error';
  }
};
