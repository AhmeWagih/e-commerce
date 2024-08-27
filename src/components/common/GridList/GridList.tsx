import { Row, Col } from "react-bootstrap";
interface IGridList<T> {
  record: T[];
  renderItem: (record: T) => React.ReactNode;
}
type HasId = { id?: number };
const GridList = <T extends HasId>({ record, renderItem }: IGridList<T>) => {
  const categoryList =
    record.length > 0
      ? record.map((record) => (
          <Col
            xs={6}
            md={3}
            key={record.id}
            className="d-flex justify-content-center mb-5 mt-2"
          >
            {renderItem(record)}
          </Col>
        ))
      : "No Category Found";
  return <Row>{categoryList}</Row>;
};

export default GridList;
