import { Container, Row, Col } from "react-bootstrap";
import Product from "../components/eCommerce/Product/Product";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import actGetProducts from "../store/products/act/actGetProducts";
import { productsCleanUp } from "../store/products/productSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
const Products = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { record } = useAppSelector((state) => state.product);
  useEffect(() => {
    dispatch(actGetProducts(params.prefix as string));
    return () => {
      dispatch(productsCleanUp());
    };
  }, [dispatch, params]);

  const productList =
    record.length > 0
      ? record.map((record) => (
          <Col
            xs={6}
            md={3}
            key={record.id}
            className="d-flex justify-content-center mb-5 mt-2"
          >
            <Product {...record} />
          </Col>
        ))
      : "No Category Found";
  return (
    <Container>
      <Row>{productList}</Row>
    </Container>
  );
};

export default Products;
