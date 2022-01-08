import { Box } from "@chakra-ui/react";

export type WrapperVariant = "regular" | "small";

type WrapperProps = {
  children: React.ReactNode;
  variant?: WrapperVariant;
};

export default function Wrapper({
  children,
  variant = "regular",
}: WrapperProps): JSX.Element {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
}
