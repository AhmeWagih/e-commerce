import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';
const Error = () => {
  return (
    <Container>
      <div className='d-flex flex-column align-items-center mt-5'>
        <LottieHandler type='notFound' />
        <Link to="/" replace={true}>
          Go Back
        </Link>
      </div>
    </Container>
  );
};

export default Error;
