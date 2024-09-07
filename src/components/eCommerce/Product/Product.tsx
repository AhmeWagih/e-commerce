import { memo, useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '../../../store/hooks';
import { addToCart } from '../../../store/cart/cartSlice';
import { TProduct } from '../../../types';
import styles from './styles.module.css';
const { product, productImg, maximumNotice } = styles;
const Product = memo(({ id, title, img, price, max, quantity }: TProduct) => {
  const dispatch = useAppDispatch();
  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const currentRemainingQuantity = max - (quantity ?? 0);
  const quantityReachedToMax = currentRemainingQuantity === 0 ? true : false;
  useEffect(() => {
    if (!isBtnDisable) return;
    setIsBtnDisable(true);
    const debounce = setTimeout(() => {
      setIsBtnDisable(false);
    }, 300);
    return () => clearTimeout(debounce);
  }, [isBtnDisable]);
  const handleAddToCart = () => {
    dispatch(addToCart(id));
    setIsBtnDisable(true);
  };
  return (
    <div className={product}>
      <div className={productImg}>
        <img src={img} alt={title} />
      </div>
      <h2>{title}</h2>
      <h3>{price.toFixed(2)} EGP</h3>
      <p className={maximumNotice}>{quantityReachedToMax ? 'Out of stock' : `${currentRemainingQuantity} In Stock`}</p>
      <Button
        variant="info"
        style={{ color: 'white' }}
        onClick={handleAddToCart}
        disabled={isBtnDisable || quantityReachedToMax}
      >
        {isBtnDisable ? <Spinner animation="border" size="sm" /> : 'Add To Cart'}
      </Button>
    </div>
  );
});

export default Product;
