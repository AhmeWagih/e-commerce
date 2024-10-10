import Category from '@components/eCommerce/Category/Category';
import Loading from '@components/feedback/loading/Loading';
import GridList from '@components/common/GridList/GridList';
import Heading from '@components/common/Heading/Heading';
import useCategories from '@hooks/useCategories';
const Categories = () => {
  const { loading, error, record } = useCategories();
  return (
    <>
      <Heading title="Categories" />
      <Loading loading={loading} error={error} type="category">
        <GridList
          emptyMassage="No categories found"
          record={record}
          renderItem={(record) => <Category {...record} />}
        />
      </Loading>
    </>
  );
};

export default Categories;
