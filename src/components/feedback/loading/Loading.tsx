interface IProps {
  loading: "idle" | "pending" | "succeeded" | "failed";
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
