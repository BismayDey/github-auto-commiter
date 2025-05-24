import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Octokit } from '@octokit/rest';
import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format, addHours, addDays, addWeeks, parseISO } from 'date-fns';

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAdI2OCc24EcTW-kmSeJLqZx0Gzav1YhoQ",
  authDomain: "linked-4afa2.firebaseapp.com",
  projectId: "linked-4afa2",
  storageBucket: "linked-4afa2.firebasestorage.app",
  messagingSenderId: "962680318028",
  appId: "1:962680318028:web:51f51ec807d70240626ce9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting configuration
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 60;

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientIP = req.ip;
  const now = Date.now();
  
  if (!rateLimits.has(clientIP)) {
    rateLimits.set(clientIP, {
      count: 1,
      windowStart: now
    });
    return next();
  }
  
  const clientLimit = rateLimits.get(clientIP);
  
  if (now - clientLimit.windowStart > RATE_LIMIT_WINDOW) {
    clientLimit.count = 1;
    clientLimit.windowStart = now;
    return next();
  }
  
  if (clientLimit.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
  
  clientLimit.count++;
  next();
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Enhanced commit function with smart scheduling and randomization
async function performCommit(userId, config, credentials, retryCount = 0) {
  try {
    const octokit = new Octokit({ auth: credentials.token });
    const [owner, repo] = config.repository.split('/');
    
    // Add randomization to commit timing
    const randomDelay = Math.floor(Math.random() * 3600000); // Random delay up to 1 hour
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    // Get the latest commit
    const { data: reference } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${config.branch}`,
    });
    
    const latestCommitSha = reference.object.sha;
    
    // Get the tree SHA
    const { data: latestCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    
    const treeSha = latestCommit.tree.sha;
    
    // Get or create README.md with smart content updates
    let readmeContent = '';
    let readmeSha = '';
    
    try {
      const { data: readme } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'README.md',
      });
      
      readmeContent = Buffer.from(readme.content, 'base64').toString();
      readmeSha = readme.sha;
    } catch (err) {
      readmeContent = `# ${repo}\n\nAuto-generated README for ${repo}`;
    }
    
    // Generate dynamic commit content
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const hiddenComment = `<!-- Last updated: ${timestamp} -->`;
    const randomSpaces = ' '.repeat(Math.floor(Math.random() * 5) + 1);
    const randomEmoji = ['📝', '🔄', '🚀', '✨', '💡', '🎯'][Math.floor(Math.random() * 6)];
    
    if (readmeContent.includes('<!-- Last updated:')) {
      readmeContent = readmeContent.replace(
        /<!-- Last updated:.*?-->/,
        `${hiddenComment}${randomSpaces}`
      );
    } else {
      readmeContent += `\n\n${hiddenComment}${randomSpaces}`;
    }
    
    // Create blob with modified content
    const { data: blob } = await octokit.git.createBlob({
      owner,
      repo,
      content: readmeContent,
      encoding: 'utf-8',
    });
    
    // Create new tree
    const { data: tree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: treeSha,
      tree: [
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        },
      ],
    });
    
    // Create commit with enhanced message
    const commitMessage = config.commitMessage
      .replace('{timestamp}', format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
      .replace('{count}', (await getCommitCount(userId) + 1).toString())
      .replace('{emoji}', randomEmoji);
    
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: tree.sha,
      parents: [latestCommitSha],
    });
    
    // Update reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${config.branch}`,
      sha: newCommit.sha,
    });
    
    // Record successful commit with enhanced metadata
    const commitRecord = {
      userId,
      repository: config.repository,
      branch: config.branch,
      timestamp: new Date(),
      status: 'success',
      commitHash: newCommit.sha,
      message: commitMessage,
      metadata: {
        randomDelay,
        emoji: randomEmoji,
        contentLength: readmeContent.length
      }
    };
    
    await setDoc(doc(db, 'commits', newCommit.sha), commitRecord);
    
    // Update status with enhanced tracking
    const statusDoc = await getDoc(doc(db, 'commitStatus', userId));
    const statusData = statusDoc.exists() ? statusDoc.data() : { totalCommits: 0 };
    
    const nextCommitDate = calculateNextCommitDate(config.frequency);
    
    await updateDoc(doc(db, 'commitStatus', userId), {
      lastCommit: new Date().toISOString(),
      nextCommit: nextCommitDate.toISOString(),
      totalCommits: (statusData.totalCommits || 0) + 1,
      lastCommitHash: newCommit.sha,
      streakCount: (statusData.streakCount || 0) + 1,
      updatedAt: new Date()
    });
    
    return { success: true, commitHash: newCommit.sha };
  } catch (err) {
    console.error('Error performing commit:', err);
    
    if (retryCount < 3) {
      console.log(`Retrying commit (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return performCommit(userId, config, credentials, retryCount + 1);
    }
    
    const commitId = Date.now().toString();
    const commitRecord = {
      userId,
      repository: config.repository,
      branch: config.branch,
      timestamp: new Date(),
      status: 'failed',
      message: config.commitMessage.replace('{timestamp}', new Date().toLocaleString()),
      error: err.message,
    };
    
    await setDoc(doc(db, 'commits', commitId), commitRecord);
    
    await updateDoc(doc(db, 'commitStatus', userId), {
      lastCommit: new Date().toISOString(),
      nextCommit: calculateNextCommitDate(config.frequency).toISOString(),
      streakCount: 0,
      updatedAt: new Date()
    });
    
    return { success: false, error: err.message };
  }
}

// Helper function to get commit count
async function getCommitCount(userId) {
  const statusDoc = await getDoc(doc(db, 'commitStatus', userId));
  return statusDoc.exists() ? (statusDoc.data().totalCommits || 0) : 0;
}

// Enhanced next commit date calculation with randomization
function calculateNextCommitDate(frequency) {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 60);
  const randomHours = Math.floor(Math.random() * 4);
  
  let nextDate;
  switch (frequency) {
    case 'hourly':
      nextDate = addHours(now, 1 + Math.floor(Math.random() * 2));
      break;
    case 'daily':
      nextDate = addDays(now, 1);
      nextDate.setHours(Math.floor(Math.random() * 24));
      break;
    case 'weekly':
      nextDate = addWeeks(now, 1);
      nextDate.setHours(Math.floor(Math.random() * 24));
      break;
    default:
      nextDate = addDays(now, 1);
  }
  
  nextDate.setMinutes(randomMinutes);
  return nextDate;
}

// Routes
app.post('/api/auth/github', rateLimit, async (req, res) => {
  try {
    const { username, token, userId } = req.body;
    
    if (!username || !token || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate GitHub credentials
    const octokit = new Octokit({ auth: token });
    
    try {
      const { data } = await octokit.users.getByUsername({ username });
      
      if (data.login !== username) {
        return res.status(401).json({ error: 'Invalid GitHub credentials' });
      }
      
      // Get user's repositories with enhanced metadata
      const { data: repos } = await octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100
      });
      
      // Store validated credentials with enhanced repository metadata
      await setDoc(doc(db, 'users', userId), {
        githubUsername: username,
        githubToken: token,
        repositories: repos.map(repo => ({
          name: repo.full_name,
          description: repo.description,
          defaultBranch: repo.default_branch,
          private: repo.private,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          lastUpdated: repo.updated_at
        })),
        updatedAt: new Date()
      }, { merge: true });
      
      return res.status(200).json({ 
        success: true, 
        message: 'GitHub credentials validated and stored',
        repositories: repos.map(repo => ({
          name: repo.full_name,
          description: repo.description,
          defaultBranch: repo.default_branch,
          private: repo.private,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          lastUpdated: repo.updated_at
        }))
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid GitHub credentials' });
    }
  } catch (err) {
    console.error('Error validating GitHub credentials:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced scheduler with smart timing
cron.schedule('* * * * *', async () => {
  try {
    console.log('Running enhanced scheduled commit check...');
    
    const statusQuery = query(
      collection(db, 'commitStatus'),
      where('active', '==', true)
    );
    
    const statusSnapshot = await getDocs(statusQuery);
    
    for (const statusDoc of statusSnapshot.docs) {
      const userId = statusDoc.id;
      const statusData = statusDoc.data();
      
      if (statusData.nextCommit && new Date(statusData.nextCommit) <= new Date()) {
        const configDoc = await getDoc(doc(db, 'commitConfig', userId));
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!configDoc.exists() || !userDoc.exists()) {
          console.log(`Missing configuration or user data for ${userId}`);
          continue;
        }
        
        const userData = userDoc.data();
        
        if (!userData.githubUsername || !userData.githubToken) {
          console.log(`No GitHub credentials for user ${userId}`);
          continue;
        }
        
        const config = configDoc.data();
        const credentials = {
          username: userData.githubUsername,
          token: userData.githubToken
        };
        
        console.log(`Performing enhanced commit for user ${userId} to ${config.repository}`);
        
        const result = await performCommit(userId, config, credentials);
        console.log(`Enhanced commit result for user ${userId}:`, result);
      }
    }
  } catch (err) {
    console.error('Error in enhanced commit scheduler:', err);
  }
});

// Health check endpoint with enhanced metrics
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    metrics: {
      activeConnections: rateLimits.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});

app.listen(PORT, () => {
  console.log(`Enhanced server running on port ${PORT}`);
});

export default app;