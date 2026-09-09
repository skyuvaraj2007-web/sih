const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/projects
router.get('/', requireAuth, (req, res) => {
  const { status, filter } = req.query;
  let projects = db.getProjects(req.user?.id);

  if (filter && filter !== 'all') {
    if (filter === 'in-progress') {
      projects = projects.filter(p => p.status.includes('In Progress'));
    } else if (filter === 'completed') {
      projects = projects.filter(p => p.status === 'Completed');
    } else if (filter === 'validated') {
      projects = projects.filter(p => p.status.includes('Validated'));
    }
  }

  const all = db.getProjects(req.user?.id);
  const metrics = {
    totalProjects: all.length,
    activeProjects: all.filter(p => p.status.includes('In Progress')).length,
    verifiedProjects: all.filter(p => p.status.includes('Validated') || p.status === 'Completed').length,
    verifiedCommits: 142,
    recruiterProofRate: 88,
    cloudSandboxesOnline: 2
  };

  res.json({
    success: true,
    data: projects,
    metrics
  });
});

// POST /api/projects
router.post('/', requireAuth, (req, res) => {
  const { title, category, techStack, repoUrl, demoUrl, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }

  const newProject = db.addProject({
    userId: req.user?.id || 'usr_student_01',
    title,
    category: category || 'FULL STACK & AI',
    techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : ['Python', 'FastAPI']),
    repoUrl: repoUrl || 'https://github.com/arunkumar/' + title.toLowerCase().replace(/\s+/g, '-'),
    demoUrl: demoUrl || '',
    description,
    progress: 15,
    status: 'In Progress (Active Sandbox)',
    statusNote: 'Initial commits indexed & verified via Git',
    sandboxAvailable: true,
    milestone: 'M1 Initialized'
  });

  res.status(201).json({
    success: true,
    message: 'Project created and initialized with active cloud sandbox.',
    data: newProject
  });
});

// POST /api/projects/:id/sandbox
router.post('/:id/sandbox', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Cloud sandbox provisioned.',
    sandbox: {
      status: 'RUNNING',
      containerId: 'sbx-' + Math.random().toString(36).substring(2, 9),
      endpoint: 'https://sandbox-node-89.nexus.internal:8080',
      terminalReady: true,
      resources: { cpu: '2 vCPU', memory: '4 GB RAM', storage: '20 GB NVMe' }
    }
  });
});

module.exports = router;
