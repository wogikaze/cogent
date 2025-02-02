import { Box, extendConfig, Flex, UIProvider } from "@yamada-ui/react";
import Editor from "./components/Editor";
import FileTree from "./components/FileTree";
import Footer from "./components/Footer";
import Header from "./components/Header";

const customConfig = extendConfig({ initialColorMode: "system" })

export default function App() {

  return (
    <UIProvider config={customConfig}>
      <Header></Header>
      <Flex h="100vh">
        <Box fontSize={"0.9rem"} minW={"160px"}>
          <FileTree></FileTree>
        </Box>
        <Editor></Editor>
      </Flex>
      <Footer></Footer>
    </UIProvider>
  )
}