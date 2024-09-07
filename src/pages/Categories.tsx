import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Category from '../components/eCommerce/Category/Category';
import actGetCategories from '../store/categories/act/actGetCategories';
import Loading from '../components/feedback/loading/Loading';
import GridList from '../components/common/GridList/GridList';
import Heading from '../components/common/Heading/Heading';
const Categories = () => {
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.category);
  useEffect(() => {
    if (!record.length) {
      dispatch(actGetCategories());
    }
  }, [dispatch, record]);

  return (
    <>
      <Heading>Categories</Heading>
      <Loading loading={loading} error={error}>
        <GridList record={record} renderItem={(record) => <Category {...record} />} />
      </Loading>
    </>
  );
};

export default Categories;
