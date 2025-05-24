import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack
} from '@mui/material';
import { 
  GitCommit, 
  Clock, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';

interface StatusCardProps {
  loading: boolean;
  active: boolean;
  lastCommit: string | null;
  nextCommit: string | null;
  totalCommits: number;
  onToggle: () => void;
  disableToggle: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  loading,
  active,
  lastCommit,
  nextCommit,
  totalCommits,
  onToggle,
  disableToggle
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Commit Status
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={onToggle}
                    disabled={disableToggle}
                  />
                }
                label={active ? "Active" : "Inactive"}
              />
            </Box>
            
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <GitCommit size={18} style={{ marginRight: 8 }} />
                <Typography variant="body2">
                  Total Commits: {totalCommits}
                </Typography>
              </Box>
              
              {lastCommit && (
                <Box display="flex" alignItems="center">
                  <Clock size={18} style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Last Commit: {new Date(lastCommit).toLocaleString()}
                  </Typography>
                </Box>
              )}
              
              {nextCommit && active && (
                <Box display="flex" alignItems="center">
                  <Calendar size={18} style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Next Commit: {new Date(nextCommit).toLocaleString()}
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
          onClick={onToggle}
          disabled={disableToggle}
          color={active ? "error" : "success"}
        >
          {active ? "Stop Auto-Commit" : "Start Auto-Commit"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default StatusCard;