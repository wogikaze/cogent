import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { FolderOpenIcon, SaveIcon } from '@yamada-ui/lucide'
import { Box, Button, Textarea } from '@yamada-ui/react'
import { useState } from 'react'

const Editor = () => {
  const [content, setContent] = useState('')
  const [filePath, setFilePath] = useState<string | null>(null)

  const handleOpen = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Text',
          extensions: ['txt'],
        },
        {
          name: 'All',
          extensions: ['*'],
        },
      ],
    })
    console.log(selected)
    if (selected) {
      const text = await invoke<string>('read_file', { path: selected })
      setContent(text)
      setFilePath(selected)
    }
  }

  const handleSave = async () => {
    if (filePath) {
      await invoke('save_file', { path: filePath, contents: content })
    } else {
      const newPath = await invoke<string>('dialog_save')
      if (newPath) {
        await invoke('save_file', { path: newPath, contents: content })
        setFilePath(newPath)
      }
    }
  }

  return (
    <Box sx={{ p: 3 }} width={"1000px"}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<FolderOpenIcon />}
          onClick={handleOpen}
          sx={{ mr: 2 }}
        >
          開く
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          保存
        </Button>
      </Box>
      <Textarea
        minRows={20}
        h="100%"
        variant="outlined"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!filePath}
        bg="gray.100"
      />
    </Box>
  )
}

export default Editor