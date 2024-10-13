import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Heading from '@components/common/Heading/Heading';
import { RegisterSchema, RegisterType } from '@validations/RegisterSchema';
import Input from '@components/forms/Input';
import useCheckEmail from '@hooks/useCheckEmail';
const Register = () => {
  const {
    register,
    handleSubmit,
    getFieldState,
    trigger,
    formState: { errors },
  } = useForm<RegisterType>({
    mode: 'onBlur',
    resolver: zodResolver(RegisterSchema),
  });
  const {
    emailState,
    enteredEmail,
    checkEmailAvailability,
    resetCheckEmailAvailability,
  } = useCheckEmail();
  const submitForm: SubmitHandler<RegisterType> = (data) => {
    console.log(data);
  };
  const emailOnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await trigger('email');
    const value = e.target.value;
    const { isDirty, invalid } = getFieldState('email');
    if (isDirty && !invalid && enteredEmail !== value) {
      checkEmailAvailability(value);
    }
    if (isDirty && invalid && enteredEmail) {
      resetCheckEmailAvailability();
    }
  };
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
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              name="lastName"
              register={register}
              error={errors.lastName?.message}
            />
            <Input
              onBlur={emailOnBlur}
              label="Email"
              name="email"
              register={register}
              error={
                errors.email?.message
                  ? errors.email?.message
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
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              error={errors.confirmPassword?.message}
            />
            <Button variant="info" type="submit" style={{ color: 'white' }} disabled={emailState === "checking" ? true : false}>
              Register
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Register;
