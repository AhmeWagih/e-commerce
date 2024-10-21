import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  actGetProductsByItems,
  cartItemChangeQuantity,
  cartItemRemove,
  productFullInfoCleanUp,
} from '@store/cart/cartSlice';
import { resetOrderState } from '@store/orders/ordersSlice';

const useCart = () => {
  const dispatch = useAppDispatch();
  const userAccessToken = useAppSelector((state) => state.auth.accessToken);
  const { items, productsFullInfo, loading, error } = useAppSelector((state) => state.cart);
  const placeOrderStatus = useAppSelector((state) => state.orders.loading);

  useEffect(() => {
    const promise = dispatch(actGetProductsByItems());
    return () => {
      promise.abort();
      dispatch(productFullInfoCleanUp());
      dispatch(resetOrderState());
    };
  }, [dispatch]);

  const products = productsFullInfo.map((el) => ({
    ...el,
    quantity: items[el.id] || 0,
  }));
  const changeQuantityHandler = useCallback(
    (id: number, quantity: number) => {
      dispatch(cartItemChangeQuantity({ id, quantity }));
    },
    [dispatch]
  );
  const removeItemHandler = useCallback(
    (id: number) => {
      dispatch(cartItemRemove(id));
    },
    [dispatch]
  );
  return {
    loading,
    error,
    products,
    userAccessToken,
    placeOrderStatus,
    changeQuantityHandler,
    removeItemHandler,
  };
};

export default useCart;
