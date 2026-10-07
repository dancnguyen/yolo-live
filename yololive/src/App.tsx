import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TopNav from './TopNav';
import LiveDetection from './LiveDetection';
import FilterPanel from './FilterPanel';

const theme = createTheme({
  colorSchemes: {
    light: { palette: { primary: { main: blue[900] } } },
    dark: { palette: { primary: { main: blue[200] } } },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          variants: [
            {
              props: { variant: 'contained', color: 'primary' },
              style: theme.applyStyles('dark', {
                backgroundColor: blue[900],
                color: theme.palette.common.white,
                '&:hover': { backgroundColor: blue[800] },
              }),
            },
          ],
        }),
      },
    },
  },
});

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);

  return(
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <TopNav onStop={isRunning ? () => setIsRunning(false) : undefined} />
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {isRunning ? (
              <LiveDetection filters={filters} />
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: '12vh' }}>
                <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={() => setIsRunning(true)}>
                  Start
                </Button>
              </Box>
            )}
          </Box>
          <FilterPanel
            filters={filters}
            onAdd={(label) => setFilters((current) => [...current, label])}
            onRemove={(label) => setFilters((current) => current.filter((f) => f !== label))}
            onClear={() => setFilters([])}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
