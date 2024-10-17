import useRegister from '@hooks/useRegister';
import { Navigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import Heading from '@components/common/Heading/Heading';
import Input from '@components/forms/Input';

const Register = () => {
  const {
    loading,
    error,
    accessToken,
    register,
    handleSubmit,
    submitForm,
    emailState,
    emailOnBlur,
    formErrors,
  } = useRegister();
  
  if (accessToken) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Heading title="User Register" />
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Form onSubmit={handleSubmit(submitForm)}>
            <Input
              label="First Name"
              name="firstName"
              register={register}
              error={formErrors.firstName?.message}
            />
            <Input
              label="Last Name"
              name="lastName"
              register={register}
              error={formErrors.lastName?.message}
            />
            <Input
              onBlur={emailOnBlur}
              label="Email"
              name="email"
              register={register}
              error={
                formErrors.email?.message
                  ? formErrors.email?.message
                  : emailState === 'unavailable'
                  ? 'This email is already in use.'
                  : emailState === 'failed'
                  ? 'Error from the server.'
                  : ''
              }
              formText={
                emailState === 'checking'
                  ? "We're currently checking the availability of this email address. Please wait a moment."
                  : ''
              }
              success={
                emailState === 'available'
                  ? 'This email is available for use.'
                  : ''
              }
              disabled={emailState === 'checking' ? true : false}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              error={formErrors.password?.message}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              error={formErrors.confirmPassword?.message}
            />
            <Button
              variant="info"
              type="submit"
              style={{ color: 'white' }}
              disabled={
                emailState === 'checking'
                  ? true
                  : false || loading === 'pending'
              }
            >
              {loading === 'pending' ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Register'
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

export default Register;
