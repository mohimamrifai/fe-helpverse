// Simple Express CORS proxy for development
// To use this: node cors-proxy.js
// Then change your .env file to: BASE_URL_API=http://localhost:8080/proxy

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8080;
const API_URL = process.env.PROXY_TARGET || 'http://localhost:5000';

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy API requests
app.use('/proxy', createProxyMiddleware({
  target: API_URL,
  pathRewrite: {
    '^/proxy': '/api'  // rewrite /proxy to /api
  },
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} -> ${API_URL}/api${req.url.replace('/proxy', '')}`);
  }
}));

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy running at http://localhost:${PORT}`);
  console.log(`Proxying to: ${API_URL}`);
  console.log(`Set your .env to: BASE_URL_API=http://localhost:${PORT}/proxy`);
}); 