import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderIcon } from "@yamada-ui/lucide";
import { Box, Button, extendConfig, Flex, UIProvider } from "@yamada-ui/react";
import { useState } from "react";
import Editor from "./components/Editor";
import FileTree, { FileNode } from "./components/FileTree";
import Footer from "./components/Footer";
import Header from "./components/Header";

const customConfig = extendConfig({ initialColorMode: "system" });

export default function App() {
  const [list_dir, setList_dir] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");

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

  // FileTree から呼び出される openFile（onFileDoubleClick）
  const openFile = async (path: string) => {
    try {
      const text = await invoke<string>("read_file", { path });
      setEditorContent(text);
      setSelectedFilePath(path);
    } catch (error) {
      console.error("ファイルの読み込みに失敗しました", error);
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
          {/* FileTree に onFileDoubleClick として openFile を渡す */}
          <FileTree fileStructure={list_dir} onFileDoubleClick={openFile} />
        </Box>
        {/* Editor に選択されたファイルとその内容を渡す */}
        <Editor selectedFile={selectedFilePath} content={editorContent} />
      </Flex>
      <Footer />
    </UIProvider>
  );
}
