import CartSubtotalPrice from '@components/eCommerce/CartSubtotalPrice/CartSubtotalPrice';
import Heading from '@components/common/Heading/Heading';
import Loading from '@components/feedback/loading/Loading';
import CartItemList from '@components/eCommerce/CartItemList/CartItemList';
import useCart from '@hooks/useCart';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';
const Cart = () => {
  const {
    loading,
    error,
    products,
    changeQuantityHandler,
    removeItemHandler,
    userAccessToken,
    placeOrderStatus,
  } = useCart();
  return (
    <>
      <Heading title="Your Cart" />
      <Loading loading={loading} error={error} type="cart">
        {products.length ? (
          <>
            <CartItemList
              products={products}
              changeQuantityHandler={changeQuantityHandler}
              removeItemHandler={removeItemHandler}
            />
            <CartSubtotalPrice
              products={products}
              userAccessToken={userAccessToken}
            />
          </>
        ) : placeOrderStatus === 'succeeded' ? (
          <LottieHandler type="success" message="Your order has been placed successfully" />
        ) : (
          <LottieHandler type="empty" message="Your cart is empty" />
        )}
      </Loading>
    </>
  );
};

export default Cart;
