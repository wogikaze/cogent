import './App.css'
import Editor from './components/Editor'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <h1>Cogent</h1>
      <Editor></Editor>
    </ThemeProvider>
  );
}