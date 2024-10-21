import { TLoading } from '@types';
import CategorySkeleton from '../skeletons/CategorySkeleton';
import ProductSkeleton from '../skeletons/ProductSkeleton';
import CartSkeleton from '../skeletons/CartSkeleton';
import LottieHandler from '../lottieHandler/LottieHandler';
import TableSkeleton from '../skeletons/TableSkeleton';

const skeletonsType = {
  category: <CategorySkeleton />,
  product: <ProductSkeleton />,
  cart: <CartSkeleton />,
  table: <TableSkeleton />,
};

interface IProps {
  loading: TLoading;
  error: string | null;
  children: React.ReactNode;
  type?: keyof typeof skeletonsType;
}
const Loading = ({ loading, error, children, type = 'category' }: IProps) => {
  if (loading === 'pending') {
    return skeletonsType[type];
  } else if (loading === 'failed') {
    return (
      <div>
        <LottieHandler type="error" message={error as string} />
      </div>
    );
  }
  return <div>{children}</div>;
};

export default Loading;
