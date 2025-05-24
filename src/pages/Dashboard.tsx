import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  MenuItem, 
  FormControl, 
  FormHelperText,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  GitCommit, 
  Calendar, 
  Clock, 
  GitBranch, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

interface CommitFormData {
  repository: string;
  branch: string;
  frequency: string;
  startDate: string;
  endDate: string;
  commitMessage: string;
}

const Dashboard: React.FC = () => {
  const { user, getGithubCredentials } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [configComplete, setConfigComplete] = useState(false);
  const [commitStatus, setCommitStatus] = useState<{
    active: boolean;
    lastCommit: string | null;
    nextCommit: string | null;
    totalCommits: number;
  }>({
    active: false,
    lastCommit: null,
    nextCommit: null,
    totalCommits: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<CommitFormData>({
    defaultValues: {
      repository: '',
      branch: 'main',
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      commitMessage: 'Auto-commit: {timestamp}'
    }
  });

  // Check if GitHub credentials are set
  useEffect(() => {
    const checkGithubConfig = async () => {
      try {
        const credentials = await getGithubCredentials();
        setConfigComplete(Boolean(credentials?.username && credentials?.token));
      } catch (err) {
        console.error('Error checking GitHub credentials:', err);
      }
    };
    
    checkGithubConfig();
  }, [getGithubCredentials]);

  // Load existing commit configuration
  useEffect(() => {
    if (!user) return;
    
    const loadCommitConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'commitConfig', user.uid));
        if (configDoc.exists()) {
          const data = configDoc.data();
          Object.entries(data).forEach(([key, value]) => {
            if (key in setValue && typeof setValue === 'function') {
              // Cast dates to proper format
              if (key === 'startDate' || key === 'endDate') {
                setValue(key as keyof CommitFormData, new Date(value as string).toISOString().split('T')[0]);
              } else {
                setValue(key as keyof CommitFormData, value as string);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error loading commit configuration:', err);
      }
    };
    
    loadCommitConfig();
  }, [user, setValue]);

  // Listen for commit status updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = onSnapshot(
      doc(db, 'commitStatus', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setCommitStatus({
            active: snapshot.data().active || false,
            lastCommit: snapshot.data().lastCommit || null,
            nextCommit: snapshot.data().nextCommit || null,
            totalCommits: snapshot.data().totalCommits || 0
          });
        }
        setStatusLoading(false);
      },
      (err) => {
        console.error('Error fetching commit status:', err);
        setStatusLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (data: CommitFormData) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Save configuration to Firestore
      await setDoc(doc(db, 'commitConfig', user.uid), {
        ...data,
        updatedAt: new Date()
      });
      
      // Call API to start/validate the auto-commit service
      const credentials = await getGithubCredentials();
      if (!credentials?.username || !credentials?.token) {
        throw new Error('GitHub credentials not found');
      }
      
      // This would normally be a call to your backend API
      // For this example, we'll simulate it with a direct Firestore update
      await setDoc(doc(db, 'commitStatus', user.uid), {
        active: true,
        lastCommit: null,
        nextCommit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        totalCommits: 0,
        updatedAt: new Date()
      });
      
      setSuccess('Auto-commit configuration saved successfully');
    } catch (err) {
      console.error('Error submitting commit configuration:', err);
      setError((err as Error).message || 'Failed to save commit configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStop = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await setDoc(doc(db, 'commitStatus', user.uid), {
        active: !commitStatus.active,
        updatedAt: new Date()
      }, { merge: true });
      
      setSuccess(`Auto-commit service ${commitStatus.active ? 'stopped' : 'started'} successfully`);
    } catch (err) {
      console.error('Error toggling commit service:', err);
      setError((err as Error).message || 'Failed to update commit service');
    } finally {
      setLoading(false);
    }
  };

  if (!configComplete) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          You need to set up your GitHub credentials before you can use the auto-commit service.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/profile')}
          fullWidth
        >
          Set Up GitHub Credentials
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Auto-Commit Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
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
                    >
                      Save Configuration
                    </LoadingButton>
                    
                    <Button 
                      variant="outlined" 
                      onClick={() => reset()}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commit Status
              </Typography>
              
              {statusLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={commitStatus.active}
                          onChange={handleStartStop}
                          disabled={loading}
                        />
                      }
                      label={commitStatus.active ? "Active" : "Inactive"}
                    />
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center">
                      <GitCommit size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body2">
                        Total Commits: {commitStatus.totalCommits}
                      </Typography>
                    </Box>
                    
                    {commitStatus.lastCommit && (
                      <Box display="flex" alignItems="center">
                        <Clock size={18} style={{ marginRight: 8 }} />
                        <Typography variant="body2">
                          Last Commit: {new Date(commitStatus.lastCommit).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    
                    {commitStatus.nextCommit && commitStatus.active && (
                      <Box display="flex" alignItems="center">
                        <Calendar size={18} style={{ marginRight: 8 }} />
                        <Typography variant="body2">
                          Next Commit: {new Date(commitStatus.nextCommit).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<RefreshCw size={16} />}
                onClick={handleStartStop}
                disabled={loading || statusLoading}
                color={commitStatus.active ? "error" : "success"}
              >
                {commitStatus.active ? "Stop Auto-Commit" : "Start Auto-Commit"}
              </Button>
            </CardActions>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center">
                  <CheckCircle size={18} color="#2da44e" style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Successful Commits: {commitStatus.totalCommits}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <XCircle size={18} color="#cf222e" style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Failed Commits: 0
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <GitBranch size={18} style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Active Repositories: 1
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;