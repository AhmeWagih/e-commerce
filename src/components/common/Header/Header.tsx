import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useEffect } from 'react';
import { actGetWishlist } from '@store/wishlist/wishlistSlice';
import { authLogout } from '@store/auth/authSlice';
import {
  Badge,
  Container,
  Nav,
  Navbar,
  NavDropdown,
} from 'react-bootstrap';
import HeaderLeftIcons from './HeaderLeftIcons/HeaderLeftIcons';
import styles from './styles.module.css';
const { headerContainer, headerLogo } = styles;
const Header = () => {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(actGetWishlist('productIds'));
    }
  }, [dispatch, accessToken]);
  return (
    <header>
      <div className={headerContainer}>
        <h1 className={headerLogo}>
          <span>Our</span> <Badge bg="info">eCom</Badge>
        </h1>
        <HeaderLeftIcons />
      </div>
      <Navbar
        expand="lg"
        className="bg-body-tertiary"
        bg="dark"
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="categories">
                Categories
              </Nav.Link>
              <Nav.Link as={NavLink} to="about">
                About
              </Nav.Link>
            </Nav>
            {!accessToken ? (
              <>
                {' '}
                <Nav>
                  <Nav.Link as={NavLink} to="login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="register">
                    Register
                  </Nav.Link>
                </Nav>
              </>
            ) : (
              <>
                <NavDropdown
                  title={` ${user?.firstName.toUpperCase()}`}
                  id="basic-nav-dropdown"
                  align="end"
                  className=" text-white"
                >
                  <NavDropdown.Item as={NavLink} to="profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="cart">Orders</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    as={NavLink}
                    to="/"
                    onClick={() => dispatch(authLogout())}
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
