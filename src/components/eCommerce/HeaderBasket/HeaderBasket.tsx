import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { getCartTotalQuantitySelector } from '../../../store/cart/selectors';
import styles from './styles.module.css';
import Logo from '../../../assets/svg/cart.svg?react';
const { basketContainer, basketQuantity, pumpCartQuantity, basketCart } = styles;
const HeaderBasket = () => {
  const navigate = useNavigate();
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
    <div className={basketContainer} onClick={() => navigate('/cart')}>
      <h3>Cart</h3>
      <div className={basketCart}>
        <Logo title="basket icon" />
        <div className={quantityStyle}>{totalQuantity}</div>
      </div>
    </div>
  );
};

export default HeaderBasket;
