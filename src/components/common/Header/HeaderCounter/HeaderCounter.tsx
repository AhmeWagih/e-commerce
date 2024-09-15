import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
const { container, totalNum, pumpAnimate, iconWrapper } = styles;
type HeaderCounterProps = {
  totalQuantity: number;
  svgIcon: React.ReactNode;
  to: string;
  title: string;
};
const HeaderCounter = ({
  totalQuantity,
  svgIcon,
  to,
  title,
}: HeaderCounterProps) => {
  const navigate = useNavigate();
  const [isAnimate, setIsAnimate] = useState(false);
  const quantityStyle = `${totalNum} ${isAnimate ? pumpAnimate : ''}`;
  useEffect(() => {
    if (!totalQuantity) {
      return;
    }
    setIsAnimate(true);
    const debounce = setTimeout(() => {
      setIsAnimate(false);
    }, 300);
    return () => clearTimeout(debounce);
  }, [totalQuantity]);
  return (
    <div className={container} onClick={() => navigate(to)}>
      <h3>{title}</h3>
      <div className={iconWrapper}>
        {svgIcon}
        {totalQuantity ? (
          <div className={quantityStyle}>{totalQuantity}</div>
        ) : null}
      </div>
    </div>
  );
};

export default HeaderCounter;
