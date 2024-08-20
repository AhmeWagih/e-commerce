import { Button } from "react-bootstrap";
import styles from "./styles.module.css";
const { product, productImg } = styles;
interface IProps {
  id: number;
  title: string;
  img: string;
  cat_prefix: string;
  price: string;
}
const Product = ({ title, img, price }: IProps) => {
  return (
    <div className={product}>
      <div className={productImg}>
        <img src={img} alt={title} />
      </div>
      <h2>{title}</h2>
      <h3>{price} EGP</h3>
      <Button variant="info" style={{ color: "white" }}>
        Add to cart
      </Button>
    </div>
  );
};

export default Product;
