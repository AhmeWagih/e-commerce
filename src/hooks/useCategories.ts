import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import actGetCategories from '@store/categories/act/actGetCategories';
import { categoryCleanUp } from '@store/categories/categorySlice';
const useCategories = () => {
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.category);
  useEffect(() => {
    const promise = dispatch(actGetCategories());
    return () => {
      dispatch(categoryCleanUp());
      promise.abort();
    };
  }, [dispatch]);
  return { record, loading, error };
};

export default useCategories;
