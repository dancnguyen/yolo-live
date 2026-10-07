import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import StopIcon from '@mui/icons-material/Stop';

type TopNavProps = {
  onStop?: () => void;
};

export default function TopNav({ onStop }: TopNavProps) {
  const { mode, setMode } = useColorScheme();
  const isDark = mode !== 'light';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({ bgcolor: blue[900], color: 'common.white', backgroundImage: 'none', zIndex: theme.zIndex.drawer + 1 })}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          YOLO Live
        </Typography>
        {onStop && (
          <Button variant="outlined" color="inherit" startIcon={<StopIcon />} onClick={onStop} sx={{ mr: 1 }}>
            Stop
          </Button>
        )}
        <Tooltip title={label}>
          <IconButton color="inherit" aria-label={label} onClick={() => setMode(isDark ? 'light' : 'dark')}>
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
