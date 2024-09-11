import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import styles from './styles.module.css';
import Logo from '../../../assets/svg/wishlist.svg?react';
const { container, totalNum, pumpAnimate, iconWrapper } = styles;
const HeaderWishlist = () => {
  const navigate = useNavigate();
  const [isAnimate, setIsAnimate] = useState(false);
  const totalQuantity = useAppSelector((state) => state.wishlist.itemsId.length);
  const quantityStyle = `${totalNum} ${isAnimate ? pumpAnimate : ''}`;
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
    <div className={container} onClick={() => navigate('/wishlist')}>
      <h3>Wishlist</h3>
      <div className={iconWrapper}>
        <Logo title="wishlist icon" />
        {totalQuantity ? <div className={quantityStyle}>{totalQuantity}</div> : null}
      </div>
    </div>
  );
};

export default HeaderWishlist;
