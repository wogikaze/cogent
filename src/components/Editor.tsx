import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SaveIcon } from '@yamada-ui/lucide';
import { Box, Button, Textarea } from '@yamada-ui/react';

interface EditorProps {
  selectedFile: string | null;
  content: string;
}

const Editor: React.FC<EditorProps> = ({ selectedFile, content }) => {
  const [localContent, setLocalContent] = React.useState(content);

  React.useEffect(() => {
    // 親から content が更新された場合、ローカルにも反映する
    setLocalContent(content);
  }, [content]);

  const handleSave = async () => {
    try {
      if (selectedFile) {
        await invoke('save_file', { path: selectedFile, contents: localContent });
      } else {
        // 新規保存の場合の処理（例: ダイアログ表示など）
        const newPath = await invoke<string>('dialog_save');
        if (newPath) {
          await invoke('save_file', { path: newPath, contents: localContent });
          // 新規保存後、必要なら親コンポーネントにパス更新を通知する仕組みを追加
        }
      }
    } catch (error) {
      console.error('ファイル保存に失敗しました', error);
    }
  };

  return (
    <Box sx={{ p: 3 }} width="1000px">
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          保存
        </Button>
      </Box>
      <Textarea
        minRows={20}
        h="100%"
        variant="outlined"
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        disabled={!selectedFile}
        bg="gray.900"
      />
    </Box>
  );
};

export default Editor;
