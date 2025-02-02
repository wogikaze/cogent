// App.tsx
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderIcon } from "@yamada-ui/lucide";
import { Box, Button, extendConfig, Flex, UIProvider } from "@yamada-ui/react";
import { useState } from "react";
import Editor from "./components/Editor";
import FileTree, { FileNode } from "./components/FileTree";
import Footer from "./components/Footer";
import Header from "./components/Header";

const customConfig = extendConfig({ initialColorMode: "system" })

export default function App() {
  const [list_dir, setList_dir] = useState<FileNode[]>([]);

  // ディレクトリ選択ダイアログを表示し、選択されたパスの直下のファイル/フォルダ一覧を取得する
  const openDir = async () => {
    const selected = await open({ directory: true });
    console.log("選択されたディレクトリ:", selected);
    if (selected) {
      try {
        const dir = await invoke<FileNode[]>("list_directory", { path: selected });
        setList_dir(dir);
      } catch (error) {
        console.error("ディレクトリ一覧の取得に失敗しました", error);
      }
    }
  };

  return (
    <UIProvider config={customConfig}>
      <Header />
      <Flex h="100vh">
        <Box fontSize="0.9rem" minW="360px">
          <Button onClick={openDir} startIcon={<FolderIcon />}>
            Open Dir
          </Button>
          <FileTree fileStructure={list_dir} />
        </Box>
        <Editor />
      </Flex>
      <Footer />
    </UIProvider>
  );
}
