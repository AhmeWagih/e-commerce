import { TProduct } from '@types';
import styles from './styles.module.css';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '@store/hooks';
import { useState } from 'react';
import { actPlaceOrders } from '@store/orders/ordersSlice';
import { cleanCart } from '@store/cart/cartSlice';
type CartSubtotalPriceProps = {
  products: TProduct[];
  userAccessToken: string | null;
};

const CartSubtotalPrice = ({
  products,
  userAccessToken,
}: CartSubtotalPriceProps) => {
  const dispatch = useAppDispatch();

  const [showModel, setShowModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = products.reduce((accumulator, el) => {
    const price = el.price;
    const quantity = el.quantity;
    if (quantity && typeof quantity === 'number') {
      return accumulator + price * quantity;
    } else {
      return accumulator;
    }
  }, 0);

  const modelHandler = () => {
    setShowModel(!showModel);
    setError(null);
  };
  const placeOrderHandler = () => {
    setLoading(true);
    dispatch(actPlaceOrders(subtotal))
      .unwrap()
      .then(() => {
        dispatch(cleanCart());
        setShowModel(false);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <Modal show={showModel} onHide={modelHandler} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Placing Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to place order with Subtotal:{' '}
          {subtotal.toFixed(2)} EGP
          {!loading && error && (
            <p style={{ color: '#DC3545', marginTop: '10px' }}>{error}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={modelHandler}>
            Close
          </Button>
          <Button
            variant="info"
            style={{ color: 'white' }}
            onClick={placeOrderHandler}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.container}>
        <span>Subtotal:</span>
        <span>{subtotal.toFixed(2)} EGP</span>
      </div>
      {userAccessToken && (
        <div className={styles.container}>
          <span></span>
          <span>
            <Button
              variant="info"
              style={{ color: 'white' }}
              onClick={modelHandler}
            >
              Proceed To Checkout
            </Button>
          </span>
        </div>
      )}
    </>
  );
};

export default CartSubtotalPrice;
