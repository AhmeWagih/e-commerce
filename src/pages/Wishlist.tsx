import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { actGetWishlist, productsFullInfoCleanUp } from '../store/wishlist/wishlistSlice';
import Loading from '../components/feedback/loading/Loading';
import GridList from '../components/common/GridList/GridList';
import Product from '../components/eCommerce/Product/Product';
import Heading from '../components/common/Heading/Heading';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { productsFullInfo, loading, error } = useAppSelector((state) => state.wishlist);
  const cartItems = useAppSelector((state) => state.cart.items);
  useEffect(() => {
    dispatch(actGetWishlist());
    return () => {
      dispatch(productsFullInfoCleanUp());
    };
  }, [dispatch]);
  const records = productsFullInfo.map((el) => ({
    ...el,
    quantity: cartItems[el.id],
    isLikeIt: true,
  }));
  return (
    <>
      <Heading>Your Wishlist</Heading>
      <Loading loading={loading} error={error}>
        {records.length ? (
          <>
            <GridList record={records} renderItem={(record) => <Product {...record} />} />
          </>
        ) : (
          'Your Wishlist is empty'
        )}
      </Loading>
    </>
  );
};

export default Wishlist;
