import Product from '@components/eCommerce/Product/Product';
import Loading from '@components/feedback/loading/Loading';
import GridList from '@components/common/GridList/GridList';
import Heading from '@components/common/Heading/Heading';
import useProducts from '@hooks/useProducts';
const Products = () => {
  const { loading, error, productsFullInfo, productPrefix } = useProducts();
  return (
    <>
      <Heading title={`${productPrefix?.toUpperCase()} Products`} />
      <Loading loading={loading} error={error} type="product">
        <GridList
          emptyMassage="No products found"
          record={productsFullInfo}
          renderItem={(record) => <Product {...record} />}
        />
      </Loading>
    </>
  );
};

export default Products;
