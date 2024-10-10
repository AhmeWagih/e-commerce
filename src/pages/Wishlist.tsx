import Loading from '@components/feedback/loading/Loading';
import GridList from '@components/common/GridList/GridList';
import Product from '@components/eCommerce/Product/Product';
import Heading from '@components/common/Heading/Heading';
import useWishlist from '@hooks/useWishlist';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';

const Wishlist = () => {
  const { loading, error, records } = useWishlist();
  return (
    <>
      <Heading title="Your Wishlist" />
      <Loading loading={loading} error={error} type="product">
        {records.length ? (
          <>
            <GridList
              // emptyMassage="Your Wishlist is empty"
              record={records}
              renderItem={(record) => <Product {...record} />}
            />
          </>
        ) : (
          <LottieHandler type="empty" message="Your Wishlist is empty" />
        )}
      </Loading>
    </>
  );
};

export default Wishlist;
