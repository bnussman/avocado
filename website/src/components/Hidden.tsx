import { useMediaQuery } from "@chakra-ui/react";

interface Props {
  children: JSX.Element;
  sm?: boolean;
  md?: boolean;
}

export function Hidden({ children, sm, md }: Props) {
  const [showSm] = useMediaQuery('(min-width: 790px)')
  const [showMd] = useMediaQuery('(min-width: 950px)')

  if (sm && showSm) {
    return children;
  }

  if (md && showMd) {
    return children;
  }

  return null;
}