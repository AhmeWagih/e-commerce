import Loading from '@components/feedback/loading/Loading';
import GridList from '@components/common/GridList/GridList';
import Product from '@components/eCommerce/Product/Product';
import Heading from '@components/common/Heading/Heading';
import useWishlist from '@hooks/useWishlist';

const Wishlist = () => {
  const { loading, error, records } = useWishlist();
  return (
    <>
      <Heading title="Your Wishlist" />
      <Loading loading={loading} error={error}>
        {records.length ? (
          <>
            <GridList
              record={records}
              renderItem={(record) => <Product {...record} />}
            />
          </>
        ) : (
          'Your Wishlist is empty'
        )}
      </Loading>
    </>
  );
};

export default Wishlist;
