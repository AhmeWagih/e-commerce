import { Container } from "react-bootstrap";
import Category from "../components/eCommerce/Category/Category";
import { useEffect } from "react";
import actGetCategories from "../store/categories/act/actGetCategories";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Loading from "../components/feedback/loading/Loading";
import GridList from "../components/common/GridList/GridList";
const Categories = () => {
  const dispatch = useAppDispatch();
  const { record, loading, error } = useAppSelector((state) => state.category);
  useEffect(() => {
    if (!record.length) {
      dispatch(actGetCategories());
    }
  }, [dispatch, record]);

  
  return (
    <Container>
      <Loading loading={loading} error={error}>
        <GridList
          record={record}
          renderItem={(record) => <Category {...record} />}
        />
        
      </Loading>
    </Container>
  );
};

export default Categories;
