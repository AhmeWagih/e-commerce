import { Container } from "react-bootstrap";
import styles from "./style.module.css";
import Header from "../../components/common/Header/Header";
import Footer from "../../components/common/Footer/Footer";
const { wrapper, container } = styles;
const MainLayout = () => {
  return (
    <Container className={container}>
      <Header />
      <div className={wrapper}></div>
      <Footer />
    </Container>
  );
};

export default MainLayout;
