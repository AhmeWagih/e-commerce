import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { productsCleanUp } from '../store/products/productSlice';
import Product from '../components/eCommerce/Product/Product';
import actGetProducts from '../store/products/act/actGetProducts';
import Loading from '../components/feedback/loading/Loading';
import GridList from '../components/common/GridList/GridList';
import Heading from '../components/common/Heading/Heading';
const Products = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.product);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItemsId = useAppSelector((state) => state.wishlist.itemsId);
  const productsFullInfo = record.map((el) => ({
    ...el,
    quantity: cartItems[el.id] || 0,
    isLikeIt: wishlistItemsId.includes(el.id),
  }));
  useEffect(() => {
    dispatch(actGetProducts(params.prefix as string));
    return () => {
      dispatch(productsCleanUp());
    };
  }, [dispatch, params]);

  return (
    <>
      <Heading>
        <span className="text-capitalize">{params.prefix} </span>Products
      </Heading>
      <Loading loading={loading} error={error}>
        <GridList record={productsFullInfo} renderItem={(record) => <Product {...record} />} />
      </Loading>
    </>
  );
};

export default Products;
