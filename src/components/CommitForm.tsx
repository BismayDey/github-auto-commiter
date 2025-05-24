import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  Alert,
  Tooltip,
  Collapse
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { GitCommit, AlertTriangle, Info } from 'lucide-react';

interface CommitFormProps {
  onSubmit: (data: CommitFormData) => Promise<void>;
  loading: boolean;
}

export interface CommitFormData {
  repository: string;
  branch: string;
  frequency: string;
  startDate: string;
  endDate: string;
  commitMessage: string;
  specificLineMode: boolean;
  filePath?: string;
  lineNumber?: number;
  incrementValue?: number;
}

const CommitForm: React.FC<CommitFormProps> = ({ onSubmit, loading }) => {
  const [specificLineMode, setSpecificLineMode] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<CommitFormData>({
    defaultValues: {
      repository: '',
      branch: 'main',
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      commitMessage: 'Auto-commit: {timestamp}',
      specificLineMode: false,
      filePath: '',
      lineNumber: 1,
      incrementValue: 1
    }
  });

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpecificLineMode(event.target.checked);
  };

  return (
    <Box>
      <Collapse in={showWarning}>
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setShowWarning(false)}>
              Dismiss
            </Button>
          }
        >
          <AlertTriangle size={20} style={{ marginRight: 8 }} />
          <Typography variant="body2">
            Please use this tool responsibly. Excessive automated commits may violate GitHub's terms of service
            and could lead to account restrictions.
          </Typography>
        </Alert>
      </Collapse>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 2
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={specificLineMode}
                    onChange={handleModeChange}
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>Specific Line Mode</Typography>
                    <Tooltip title="Only modify a specific line in the file for each commit">
                      <Info size={16} />
                    </Tooltip>
                  </Stack>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="repository"
                control={control}
                rules={{ required: 'Repository name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Repository Name"
                    fullWidth
                    placeholder="username/repository"
                    error={Boolean(errors.repository)}
                    helperText={errors.repository?.message || 'Enter the full repository name (e.g., username/repo)'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="branch"
                control={control}
                rules={{ required: 'Branch is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Branch"
                    fullWidth
                    placeholder="main"
                    error={Boolean(errors.branch)}
                    helperText={errors.branch?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="frequency"
                control={control}
                rules={{ required: 'Frequency is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Commit Frequency"
                    fullWidth
                    error={Boolean(errors.frequency)}
                    helperText={errors.frequency?.message}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {specificLineMode && (
              <>
                <Grid item xs={12}>
                  <Controller
                    name="filePath"
                    control={control}
                    rules={{ required: specificLineMode ? 'File path is required' : false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="File Path"
                        fullWidth
                        placeholder="path/to/file.txt"
                        error={Boolean(errors.filePath)}
                        helperText={errors.filePath?.message || 'Enter the path to the file you want to modify'}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lineNumber"
                    control={control}
                    rules={{ 
                      required: specificLineMode ? 'Line number is required' : false,
                      min: { value: 1, message: 'Line number must be positive' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Line Number"
                        fullWidth
                        error={Boolean(errors.lineNumber)}
                        helperText={errors.lineNumber?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="incrementValue"
                    control={control}
                    rules={{ 
                      required: specificLineMode ? 'Increment value is required' : false
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Increment Value"
                        fullWidth
                        error={Boolean(errors.incrementValue)}
                        helperText={errors.incrementValue?.message || 'Value to add to the number in each commit'}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'Start date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Start Date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.startDate)}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="endDate"
                control={control}
                rules={{ 
                  required: 'End date is required',
                  validate: value => !value || new Date(value) > new Date() || 'End date must be in the future'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="End Date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.endDate)}
                    helperText={errors.endDate?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="commitMessage"
                control={control}
                rules={{ required: 'Commit message is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Commit Message Template"
                    fullWidth
                    placeholder="Auto-commit: {timestamp}"
                    error={Boolean(errors.commitMessage)}
                    helperText={errors.commitMessage?.message || 'Use {timestamp} to include the date and time'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <LoadingButton 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  loading={loading}
                  startIcon={<GitCommit size={18} />}
                  sx={{
                    background: 'linear-gradient(45deg, #0969da 30%, #2da44e 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0550ae 30%, #1a7f37 90%)',
                    }
                  }}
                >
                  Save Configuration
                </LoadingButton>
                
                <Button 
                  variant="outlined" 
                  onClick={() => reset()}
                  sx={{
                    borderColor: '#0969da',
                    color: '#0969da',
                    '&:hover': {
                      borderColor: '#0550ae',
                      backgroundColor: 'rgba(9, 105, 218, 0.1)',
                    }
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CommitForm;