import { TLoading } from '@types';
import CategorySkeleton from '../skeletons/CategorySkeleton';
import ProductSkeleton from '../skeletons/ProductSkeleton';
import CartSkeleton from '../skeletons/CartSkeleton';
import LottieHandler from '../lottieHandler/LottieHandler';

const skeletonsType = {
  category: <CategorySkeleton />,
  product: <ProductSkeleton />,
  cart: <CartSkeleton />,
};

interface IProps {
  loading: TLoading;
  error: string | null;
  children: React.ReactNode;
  type?: keyof typeof skeletonsType;
}
const Loading = ({ loading, error, children, type = 'category' }: IProps) => {
  // const Skeleton = skeletonsType[type]
  if (loading === 'pending') {
    // return <Skeleton />;
    return skeletonsType[type];
  } else if (loading === 'failed') {
    return (
      <div>
        <LottieHandler type="error" message={error as string}/>
      </div>
    );
  }
  return <div>{children}</div>;
};

export default Loading;
