import useLogin from '@hooks/useLogin';
import { Navigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import Input from '@components/forms/Input';
import Heading from '@components/common/Heading/Heading';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {

  const {
    loading,
    error,
    submitForm,
    formErrors,
    accessToken,
    register,
    handleSubmit,
  } = useLogin();
  if (accessToken) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <ToastContainer />
      <Heading title="User Login" />
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Form onSubmit={handleSubmit(submitForm)}>
            <Input
              label="Email"
              name="email"
              register={register}
              error={formErrors.email?.message}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              error={formErrors.password?.message}
            />
            <Button variant="info" type="submit" style={{ color: 'white' }}>
              {loading === 'pending' ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Login'
              )}
            </Button>
            {error && (
              <p style={{ color: '#DC3545', marginTop: '10px' }}>{error}</p>
            )}
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Login;
