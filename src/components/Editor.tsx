import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { Button, TextField, Box } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

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
      <TextField
        multiline
        fullWidth
        minRows={20}
        variant="outlined"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!filePath}
      />
    </Box>
  )
}

export default Editor