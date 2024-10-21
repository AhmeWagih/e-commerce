import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { actGetUserOrders, resetOrderState } from '@store/orders/ordersSlice';
import { TProduct } from '@types';

const useOrders = () => {
  const dispatch = useAppDispatch();
  const { ordersList, loading, error } = useAppSelector(
    (state) => state.orders
  );

  const [model, setModel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TProduct[]>([]);

  const viewDetailHandler = (id: number) => {
    const selectedOrder = ordersList.find((order) => order.id === id);
    setModel(true);
    setSelectedProduct((prev) => [...prev, ...(selectedOrder?.items || [])]);
  };
  const closeModel = () => {
    setModel(false);
    setSelectedProduct([]);
  };

  useEffect(() => {
    const promise = dispatch(actGetUserOrders());
    return () => {
      promise.abort();
      dispatch(resetOrderState());
    };
  }, [dispatch]);
  return {
    ordersList,
    loading,
    error,
    model,
    selectedProduct,
    viewDetailHandler,
    closeModel,
  };
};

export default useOrders;
