import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { productsCleanUp } from '@store/products/productSlice';
import actGetProducts from '@store/products/act/actGetProducts';

const useProducts = () => {
  const params = useParams();
  const productPrefix = params.prefix;
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.product);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItemsId = useAppSelector((state) => state.wishlist.itemsId);
  const productsFullInfo = record.map((el) => ({
    ...el,
    quantity: cartItems[el.id] || 0,
    isLikeIt: wishlistItemsId.includes(el.id),
  }));
  useEffect(() => {
    const promise = dispatch(actGetProducts(params.prefix as string));
    return () => {
      dispatch(productsCleanUp());
      promise.abort();
    };
  }, [dispatch, params]);
  return { loading, error, productsFullInfo, productPrefix };
};

export default useProducts;
