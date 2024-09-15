import { useAppSelector } from '@store/hooks';
import { getCartTotalQuantitySelector } from '@store/cart/selectors';
import HeaderCounter from '../HeaderCounter/HeaderCounter';
import WishlistLogo from '@assets/svg/wishlist.svg?react';
import CartLogo from '@assets/svg/cart.svg?react';
import styles from './styles.module.css';
const { headerIcons } = styles;
const HeaderLeftIcons = () => {
  const cartTotalQuantity = useAppSelector(getCartTotalQuantitySelector);
  const wishlistTotalQuantity = useAppSelector(
    (state) => state.wishlist.itemsId.length
  );
  return (
    <div className={headerIcons}>
      <HeaderCounter
        totalQuantity={wishlistTotalQuantity}
        to="/wishlist"
        title="wishlist"
        svgIcon={<WishlistLogo title='wishlist'/>}
      />
      <HeaderCounter
        totalQuantity={cartTotalQuantity}
        to="/cart"
        title="cart"
        svgIcon={<CartLogo title='cart'/>}
      />
    </div>
  );
};

export default HeaderLeftIcons;
