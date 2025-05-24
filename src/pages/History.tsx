import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  GitCommit, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  Search,
  Calendar
} from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface CommitRecord {
  id: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  commitHash?: string;
  message: string;
  repository: string;
  error?: string;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchCommits = async (reset = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let commitQuery = query(
        collection(db, 'commits'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(rowsPerPage)
      );
      
      if (lastVisible && !reset) {
        commitQuery = query(
          collection(db, 'commits'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(rowsPerPage)
        );
      }
      
      const snapshot = await getDocs(commitQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        if (reset) setCommits([]);
        return;
      }
      
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      const commitData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp.toDate(),
          status: data.status,
          commitHash: data.commitHash,
          message: data.message,
          repository: data.repository,
          error: data.error
        } as CommitRecord;
      });
      
      if (reset) {
        setCommits(commitData);
      } else {
        setCommits(prev => [...prev, ...commitData]);
      }
    } catch (err) {
      console.error('Error fetching commit history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    if (newPage > page && hasMore) {
      fetchCommits();
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setLastVisible(null);
    setHasMore(true);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredCommits = commits.filter(commit => 
    commit.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (commit.commitHash && commit.commitHash.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'success':
        return <Chip 
          icon={<Check size={16} />} 
          label="Success" 
          color="success" 
          size="small" 
          variant="outlined"
        />;
      case 'failed':
        return <Chip 
          icon={<X size={16} />} 
          label="Failed" 
          color="error" 
          size="small" 
          variant="outlined"
        />;
      case 'pending':
        return <Chip 
          icon={<AlertTriangle size={16} />} 
          label="Pending" 
          color="warning" 
          size="small" 
          variant="outlined"
        />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Commit History
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box px={2} py={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <GitCommit size={20} style={{ marginRight: 8 }} />
            Recent Commits
          </Typography>
          
          <TextField
            placeholder="Search commits..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 250 } }}
          />
        </Box>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Repository</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Calendar size={16} style={{ marginRight: 4 }} />
                    Date & Time
                  </Box>
                </TableCell>
                <TableCell>Commit Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {loading && page === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredCommits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    {searchQuery ? 'No commits matching your search' : 'No commits yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommits
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((commit) => (
                    <TableRow key={commit.id} hover>
                      <TableCell>{commit.repository}</TableCell>
                      <TableCell>
                        {commit.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {commit.message}
                      </TableCell>
                      <TableCell>{getStatusChip(commit.status)}</TableCell>
                      <TableCell align="right">
                        {commit.commitHash && (
                          <Tooltip title="View on GitHub">
                            <IconButton 
                              size="small"
                              href={`https://github.com/${commit.repository}/commit/${commit.commitHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
              
              {loading && page > 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 1 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to }) => `${from}-${to}`}
        />
      </Paper>
    </Box>
  );
};

export default History;