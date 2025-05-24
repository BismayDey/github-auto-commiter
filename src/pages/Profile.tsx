import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Alert,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { Eye, EyeOff, Github, User, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GithubCredentialsForm {
  username: string;
  token: string;
}

const Profile: React.FC = () => {
  const { user, updateGithubCredentials, getGithubCredentials } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToken, setShowToken] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<GithubCredentialsForm>({
    defaultValues: {
      username: '',
      token: ''
    }
  });

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const credentials = await getGithubCredentials();
        if (credentials) {
          setValue('username', credentials.username);
          setValue('token', credentials.token);
        }
      } catch (err) {
        console.error('Error loading GitHub credentials:', err);
        setError('Failed to load GitHub credentials');
      }
    };
    
    loadCredentials();
  }, [getGithubCredentials, setValue]);

  const onSubmit = async (data: GithubCredentialsForm) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateGithubCredentials(data.username, data.token);
      
      setSuccess('GitHub credentials updated successfully');
    } catch (err) {
      console.error('Error updating GitHub credentials:', err);
      setError((err as Error).message || 'Failed to update GitHub credentials');
    } finally {
      setLoading(false);
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Profile Settings
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Github size={24} color="#0969da" />
          <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
            GitHub Credentials
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          To use the auto-commit feature, you need to provide your GitHub username and a personal access token with repository access.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your token needs <strong>repo</strong> scope permissions. You can create a new token in your{' '}
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'inherit', fontWeight: 'bold' }}
            >
              GitHub Developer Settings
            </a>.
          </Typography>
        </Alert>
        
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
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'GitHub username is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="GitHub Username"
                    fullWidth
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="token"
                control={control}
                rules={{ required: 'Personal access token is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Personal Access Token"
                    fullWidth
                    type={showToken ? 'text' : 'password'}
                    error={Boolean(errors.token)}
                    helperText={errors.token?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Key size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle token visibility"
                            onClick={toggleTokenVisibility}
                            edge="end"
                          >
                            {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <LoadingButton 
              type="submit" 
              variant="contained" 
              color="primary"
              loading={loading}
            >
              Save Credentials
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
      
      <Box mt={4}>
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={4} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {user.email}
              </Typography>
            </Grid>
            
            <Grid item xs={4} sm={3}>
              <Typography variant="body2" color="text.secondary">
                User ID:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user.uid}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Profile;