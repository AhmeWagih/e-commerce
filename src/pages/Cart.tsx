import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  actGetProductsByItems,
  cartItemChangeQuantity,
  cartItemRemove,
  productFullInfoCleanUp,
} from '../store/cart/cartSlice';
import CartSubtotalPrice from '../components/eCommerce/CartSubtotalPrice/CartSubtotalPrice';
import Heading from '../components/common/Heading/Heading';
import Loading from '../components/feedback/loading/Loading';
import CartItemList from '../components/eCommerce/CartItemList/CartItemList';
const Cart = () => {
  const dispatch = useAppDispatch();
  const { items, productsFullInfo, loading, error } = useAppSelector((state) => state.cart);
  useEffect(() => {
    dispatch(actGetProductsByItems());
    return () => {
      dispatch(productFullInfoCleanUp());
    };
  }, [dispatch]);
  const products = productsFullInfo.map((el) => ({ ...el, quantity: items[el.id] || 0 }));
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
  return (
    <>
      <Heading>Your Cart</Heading>
      <Loading loading={loading} error={error}>
        {products.length ? (
          <>
            <CartItemList
              products={products}
              changeQuantityHandler={changeQuantityHandler}
              removeItemHandler={removeItemHandler}
            />
            <CartSubtotalPrice products={products} />
          </>
        ) : (
          'Your Cart is empty'
        )}
      </Loading>
    </>
  );
};

export default Cart;
