import { Row, Col } from 'react-bootstrap';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';
interface IGridList<T> {
  record: T[];
  renderItem: (record: T) => React.ReactNode;
  emptyMassage?: string;
}
type HasId = { id?: number };
const GridList = <T extends HasId>({
  record,
  renderItem,
  emptyMassage,
}: IGridList<T>) => {
  const categoryList =
    record.length > 0 ? (
      record.map((record) => (
        <Col
          xs={6}
          md={3}
          key={record.id}
          className="d-flex justify-content-center mb-5 mt-2"
        >
          {renderItem(record)}
        </Col>
      ))
    ) : (
      <LottieHandler type="empty" message={emptyMassage} />
    );
  return <Row>{categoryList}</Row>;
};

export default GridList;
