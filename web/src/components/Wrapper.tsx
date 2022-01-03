import { Box } from "@chakra-ui/react";

type WrapperProps = {
  children: React.ReactNode;
  variant?: "regular" | "small";
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