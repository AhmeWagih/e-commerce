import { Container, Row, Col } from "react-bootstrap";
import Category from "../components/eCommerce/Category/Category";

import { useEffect } from "react";
import actGetCategories from "../store/categories/act/actGetCategories";
import { useAppDispatch, useAppSelector } from "../store/hooks";
const Categories = () => {
  const dispatch = useAppDispatch();
  const { record } = useAppSelector((state) => state.category);
  useEffect(() => {
    if (!record.length) {
      dispatch(actGetCategories());
    }
  }, [dispatch, record]);

  const categoryList =
    record.length > 0
      ? record.map((record) => (
          <Col
            xs={6}
            md={3}
            key={record.id}
            className="d-flex justify-content-center mb-5 mt-2"
          >
            <Category {...record} />
          </Col>
        ))
      : "No Category Found";
  return (
    <Container>
      <Row>{categoryList}</Row>
    </Container>
  );
};

export default Categories;
