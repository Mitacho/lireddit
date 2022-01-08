import Navbar from "./Navbar";
import Wrapper from "./Wrapper";

import type { WrapperVariant } from "./Wrapper";

type Props = {
  children?: React.ReactNode;
  variant?: WrapperVariant;
};

export default function Layout({ children, variant }: Props): JSX.Element {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
}
