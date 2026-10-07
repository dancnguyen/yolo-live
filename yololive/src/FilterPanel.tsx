import { useState, type SubmitEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LABELS } from './detector';

type FilterPanelProps = {
  filters: string[];
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
  onClear: () => void;
};

export default function FilterPanel({ filters, onAdd, onRemove, onClear }: FilterPanelProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = input.trim().toLowerCase();
    if (!label) return;
    if (!LABELS.includes(label)) {
      setError(`"${input.trim()}" is not an object YOLO26n can detect.`);
      return;
    }
    if (!filters.includes(label)) onAdd(label);
    setInput('');
    setError(null);
  };

  return (
    <Paper
      component="section"
      aria-label="Filter"
      square
      elevation={8}
      sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
    >
      <ButtonBase
        aria-expanded={expanded}
        aria-controls="filter-panel-content"
        onClick={() => setExpanded((value) => !value)}
        sx={{ width: '100%', px: 2, py: 1, display: 'flex', justifyContent: 'flex-start', gap: 1, textAlign: 'left' }}
      >
        <FilterListIcon fontSize="small" />
        <Typography variant="subtitle2" component="span" sx={{ flexShrink: 0 }}>
          Filter
        </Typography>
        <Typography variant="body2" component="span" noWrap sx={{ flexGrow: 1, minWidth: 0, color: 'text.secondary' }}>
          {filters.length === 0 ? '· Showing all objects' : `· ${filters.length} active: ${filters.join(', ')}`}
        </Typography>
        {expanded ? <ExpandMoreIcon titleAccess="Collapse filters" /> : <ExpandLessIcon titleAccess="Expand filters" />}
      </ButtonBase>
      <Collapse in={expanded} id="filter-panel-content">
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, pb: 1.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-start' }, gap: { xs: 1.5, md: 2 } }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ flex: { md: 3 }, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1 }}>
            <Autocomplete
              freeSolo
              options={LABELS}
              inputValue={input}
              onInputChange={(_, value) => {
                setInput(value);
                setError(null);
              }}
              sx={{ flex: '1 1 240px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Object name"
                  placeholder="e.g. book"
                  size="small"
                  error={!!error}
                  helperText={error}
                />
              )}
            />
            <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!input.trim()} sx={{ height: 40 }}>
              Add Filter
            </Button>
            <Button variant="outlined" startIcon={<ClearAllIcon />} disabled={filters.length === 0} onClick={onClear} sx={{ height: 40 }}>
              Clear Filters
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ flex: { md: 2 }, maxHeight: 136 }}>
            <Table stickyHeader size="small" aria-label="Current Filters">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Current Filters</TableCell>
                  <TableCell align="right" sx={{ width: 0 }}>
                    <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                      Actions
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ color: 'text.secondary' }}>No filters set. Showing all detected objects.</TableCell>
                  </TableRow>
                ) : (
                  filters.map((label) => (
                    <TableRow key={label}>
                      <TableCell>{label}</TableCell>
                      <TableCell align="right" sx={{ py: 0 }}>
                        <Tooltip title="Remove">
                          <IconButton size="small" aria-label={`Remove ${label} filter`} onClick={() => onRemove(label)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Collapse>
    </Paper>
  );
}
