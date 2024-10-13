import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginType } from '@validations/LoginSchema';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Input from '@components/forms/Input';
import Heading from '@components/common/Heading/Heading';
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    mode: 'onBlur',
    resolver: zodResolver(LoginSchema),
  });
  const submitForm: SubmitHandler<LoginType> = (data) => {
    console.log(data);
  };
  return (
    <>
      <Heading title="User Login" />
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Form onSubmit={handleSubmit(submitForm)}>
            <Input
              label="Email"
              name="email"
              register={register}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password?.message}
            />
            <Button variant="info" type="submit" style={{ color: 'white' }}>
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Login;
