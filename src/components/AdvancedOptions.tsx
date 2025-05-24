import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Collapse
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { Info } from 'lucide-react';

interface AdvancedOptionsProps {
  control: any;
  watch: any;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ control, watch }) => {
  const randomizeTime = watch('randomizeTime');
  const useCustomPattern = watch('useCustomPattern');
  const useSmartCommits = watch('useSmartCommits');

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Options
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="randomizeTime"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Randomize Commit Times</Typography>
                    <Tooltip title="Add random delays to commit times to make the pattern look more natural">
                      <Info size={16} sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="useCustomPattern"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Use Custom Commit Pattern</Typography>
                    <Tooltip title="Create a specific pattern of commits on your contribution graph">
                      <Info size={16} sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="useSmartCommits"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Smart Commits</Typography>
                    <Tooltip title="Automatically generate meaningful commit messages based on file changes">
                      <Info size={16} sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Collapse in={randomizeTime}>
            <Controller
              name="timeVariation"
              control={control}
              defaultValue="medium"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Time Variation"
                  helperText="How much should commit times vary?"
                >
                  <MenuItem value="low">Low (±30 minutes)</MenuItem>
                  <MenuItem value="medium">Medium (±2 hours)</MenuItem>
                  <MenuItem value="high">High (±4 hours)</MenuItem>
                </TextField>
              )}
            />
          </Collapse>
        </Grid>

        <Grid item xs={12}>
          <Collapse in={useCustomPattern}>
            <Controller
              name="commitPattern"
              control={control}
              defaultValue="uniform"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Commit Pattern"
                  helperText="Choose a pattern for your contribution graph"
                >
                  <MenuItem value="uniform">Uniform</MenuItem>
                  <MenuItem value="gradient">Gradient</MenuItem>
                  <MenuItem value="wave">Wave</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </TextField>
              )}
            />
          </Collapse>
        </Grid>

        <Grid item xs={12}>
          <Collapse in={useSmartCommits}>
            <Controller
              name="commitStyle"
              control={control}
              defaultValue="conventional"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Commit Style"
                  helperText="Choose a commit message style"
                >
                  <MenuItem value="conventional">Conventional Commits</MenuItem>
                  <MenuItem value="gitmoji">Gitmoji</MenuItem>
                  <MenuItem value="simple">Simple</MenuItem>
                </TextField>
              )}
            />
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdvancedOptions;