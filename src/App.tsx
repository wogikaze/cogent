import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import Editor from './components/Editor';
import FileTree from './components/FileTree';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

// App.tsx
import { AppBar, Box, Button, Grid, Toolbar } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

export default function App() {
  const [currentDir, setCurrentDir] = useState<string | null>(null);

  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
      });

      if (typeof selected === 'string') {
        // パスのバリデーション
        const isValid = await invoke('validate_path', { path: selected });
        if (isValid) {
          setCurrentDir(selected);
        } else {
          console.error('Invalid directory path');
        }
      }
    } catch (error) {
      console.error('Error opening dialog:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <h1 style={{ flexGrow: 1, fontSize: '1.5rem', margin: 0 }}>Cogent</h1>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenFolder}
            >
              Open Folder
            </Button>
          </Toolbar>
        </AppBar>

        <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Grid item xs={3} sx={{ borderRight: '1px solid #555', height: '100%' }}>
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              {currentDir && <FileTree currentDir={currentDir} />}
            </Box>
          </Grid>

          <Grid item xs={9} sx={{ height: '100%' }}>
            <Box sx={{ height: '100%' }}>
              <Editor />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}