import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  actGetWishlist,
  productsFullInfoCleanUp,
} from '@store/wishlist/wishlistSlice';

const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { productsFullInfo, loading, error } = useAppSelector(
    (state) => state.wishlist
  );
  const cartItems = useAppSelector((state) => state.cart.items);
  useEffect(() => {
    const promise = dispatch(actGetWishlist("productsFullInfo"));
    return () => {
      dispatch(productsFullInfoCleanUp());
      promise.abort();
    };
  }, [dispatch]);
  const records = productsFullInfo.map((el) => ({
    ...el,
    quantity: cartItems[el.id],
    isLikeIt: true,
  }));
  return { loading, records, error };
};

export default useWishlist;
