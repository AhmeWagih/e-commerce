import { TLoading } from "@types";

interface IProps {
  loading: TLoading;
  error: string | null;
  children: React.ReactNode;
}
const Loading = ({ loading, error, children }: IProps) => {
  if (loading === "pending") {
    return <div>loading please wait</div>;
  } else if (loading === "failed") {
    return <div>{error}</div>;
  }
  return <div>{children}</div>;
};

export default Loading;
