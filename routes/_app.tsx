// support jsx on deno deploy
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import Header from "../components/Header.tsx";
import { ChakraProvider } from "@chakra-ui/react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <Header />
      {children}
    </ChakraProvider>
  );
}
