import styles from './styles.module.css';
import Logo from '../../../assets/svg/cart.svg?react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getCartTotalQuantitySelector } from '../../../store/cart/selectors';
const { basketContainer, basketQuantity, pumpCartQuantity, basketCart } = styles;
const HeaderBasket = () => {
  const [isAnimate, setIsAnimate] = useState(false);
  const totalQuantity = useAppSelector(getCartTotalQuantitySelector);
  const quantityStyle = `${basketQuantity} ${isAnimate ? pumpCartQuantity : ''}`;
  useEffect(() => {
    if (!totalQuantity) {
      return;
    }
    setIsAnimate(true);
    const debounce = setTimeout(() => {
      setIsAnimate(false);
    }, 300);
    return () => clearTimeout(debounce);
  }, [totalQuantity]);
  return (
    <div className={basketContainer}>
      <h3>Cart</h3>
      <div className={basketCart}>
        <Logo title="basket icon" />
        <div className={quantityStyle}>{totalQuantity}</div>
      </div>
    </div>
  );
};

export default HeaderBasket;
