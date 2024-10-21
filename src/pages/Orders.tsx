import useOrders from '@hooks/useOrders';
import ProductInfo from '@components/eCommerce/ProductInfo/ProductInfo';
import Heading from '@components/common/Heading/Heading';
import Loading from '@components/feedback/loading/Loading';
import { Table, Modal } from 'react-bootstrap';
const Orders = () => {
  const {
    ordersList,
    loading,
    error,
    model,
    selectedProduct,
    viewDetailHandler,
    closeModel,
  } = useOrders();
  return (
    <>
      {model && (
        <Modal show={model} onHide={closeModel}>
          <Modal.Header closeButton>
            <Modal.Title>Product Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct.map((product) => (
              <ProductInfo
                key={product.id}
                title={product.title}
                img={product.img}
                price={product.price}
                quantity={product.quantity}
                direction="column"
                style={{ marginBottom: '10px' }}
              />
            ))}
          </Modal.Body>
        </Modal>
      )}
      <Heading title="My Orders" />
      <Loading loading={loading} error={error} type="table">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Items</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.items.length} item(s){'/'}
                  <span
                    onClick={() => viewDetailHandler(order.id)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Product Details
                  </span>
                </td>
                <td>{order.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Loading>
    </>
  );
};

export default Orders;
