import { memo, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { actLikeToggle } from '@store/wishlist/wishlistSlice';
import { Button, Spinner } from 'react-bootstrap';
import { addToCart } from '@store/cart/cartSlice';
import { TProduct } from '@types';
import DisLike from '@assets/svg/like.svg?react';
import Like from '@assets/svg/like-fill.svg?react';
import styles from './styles.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductInfo from '../ProductInfo/ProductInfo';

const { maximumNotice, wishlistBtn } = styles;

const Product = memo(
  ({ id, title, img, price, max, quantity, isLikeIt }: TProduct) => {
    const dispatch = useAppDispatch();
    const [isBtnDisable, setIsBtnDisable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const currentRemainingQuantity = max - (quantity ?? 0);
    const quantityReachedToMax = currentRemainingQuantity === 0 ? true : false;

    const { accessToken } = useAppSelector((state) => state.auth);

    useEffect(() => {
      if (!isBtnDisable) return;
      setIsBtnDisable(true);
      const debounce = setTimeout(() => {
        setIsBtnDisable(false);
      }, 300);
      return () => clearTimeout(debounce);
    }, [isBtnDisable]);

    const handleAddToCart = () => {
      if (quantityReachedToMax) {
        toast.error('Sorry, this product is out of stock.');
        return; // Exit the function if the product is out of stock
      }
      
      if (!accessToken) {
        toast.error('You Must Login First');
        return;
      }

      dispatch(addToCart(id));
      setIsBtnDisable(true);
    };

    const likeToggleHandler = () => {
      // Check if the user is logged in
      if (!accessToken) {
        toast.error('You Must Login First');
        return;
      }
    
      // Prevent action if already loading
      if (isLoading) return;
      setIsLoading(true);
    
      // Dispatch the toggle like action
      dispatch(actLikeToggle(id))
        .unwrap()
        .then(() => {
          setIsLoading(false);
          //Show the appropriate toast message based on whether the item is liked or not
          if (isLikeIt) {
            toast.info('Removed from Wishlist');
          } else {
            toast.success('Added to Wishlist');
          }
        })
        .catch(() => setIsLoading(false));
    };
    

    return (
      <ProductInfo title={title} price={price} img={img}>
        <ToastContainer />
        <div className={wishlistBtn} onClick={likeToggleHandler}>
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : isLikeIt ? (
            <Like />
          ) : (
            <DisLike />
          )}
        </div>
        <p className={maximumNotice}>
          {quantityReachedToMax
            ? 'Out of stock'
            : `${currentRemainingQuantity} In Stock`}
        </p>
        <Button
          variant="info"
          style={{ color: 'white', width: '100%' }}
          onClick={handleAddToCart}
          disabled={isBtnDisable || quantityReachedToMax}
        >
          {isBtnDisable ? (
            <Spinner animation="border" size="sm" />
          ) : (
            'Add To Cart'
          )}
        </Button>
      </ProductInfo>
    );
  }
);

export default Product;
