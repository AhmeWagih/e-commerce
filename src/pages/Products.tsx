import { Container } from "react-bootstrap";
import Product from "../components/eCommerce/Product/Product";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import actGetProducts from "../store/products/act/actGetProducts";
import { productsCleanUp } from "../store/products/productSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/feedback/loading/Loading";
import GridList from "../components/common/GridList/GridList";
const Products = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.product);
  useEffect(() => {
    dispatch(actGetProducts(params.prefix as string));
    return () => {
      dispatch(productsCleanUp());
    };
  }, [dispatch, params]);

  return (
    <Container>
      <Loading loading={loading} error={error}>
        <GridList
          record={record}
          renderItem={(record) => <Product {...record} />}
        />
      </Loading>
    </Container>
  );
};

export default Products;
