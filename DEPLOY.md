# ScrypGen Deployment Guide

> Alsania Protocol v1.0 - Built by Sigma, Powered by Echo

This document provides comprehensive instructions for deploying ScrypGen in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [System Integration](#system-integration)
- [Configuration](#configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+), macOS 10.15+, Windows 10+
- **Node.js**: Version 16.0.0 or higher
- **Python**: Version 3.8.0 or higher (for Python script generation)
- **Bash**: Version 4.0+ (for Bash script generation)
- **Memory**: Minimum 512MB RAM, recommended 1GB+
- **Storage**: Minimum 100MB free space
- **Network**: Internet connection for dependency installation

### Required Dependencies

```bash
# Core dependencies
npm install -g @types/node typescript

# System tools
sudo apt-get update && sudo apt-get install -y \
    build-essential \
    python3-dev \
    bash \
    curl \
    git

# Optional: For extended integrations
sudo apt-get install -y \
    nemo \
    kdeconnect \
    code
```

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/alsania-dev/ScrypGen.git
cd ScrypGen

# Install dependencies
make install

# Build the project
make build

# Run tests
make test
```

### 2. Development Workflow

```bash
# Start development server
make dev

# Run linting and formatting
make lint
make format

# Run specific tests
npm run test:unit
npm run test:integration
```

### 3. Local CLI Usage

```bash
# Install globally for CLI access
make install-global

# Test the installation
scrypgen --version
scrypgen health

# Generate a sample script
scrypgen generate "Create a backup script" --output test_backup.sh
```

## Production Deployment

### Automated Deployment

```bash
# Full production setup
make production

# Or step-by-step
make clean
make install
make build
make test
npm run build -- --mode production
```

### Manual Deployment

#### 1. Build Distribution

```bash
# Create production build
npm run build

# Create distribution package
npm pack

# The package will be created as scrypgen-x.x.x.tgz
```

#### 2. Install on Target System

```bash
# Install the package globally
npm install -g scrypgen-x.x.x.tgz

# Verify installation
scrypgen --version
scrypgen health
```

#### 3. Configure Environment

```bash
# Copy environment configuration
cp .env.example .env

# Edit configuration as needed
nano .env

# Set environment variables
export NODE_ENV=production
export LOG_LEVEL=INFO
```

## Docker Deployment

### Using Pre-built Image

```bash
# Pull the official image
docker pull alsania/scrypgen:latest

# Run with default configuration
docker run -it --rm alsania/scrypgen:latest --help

# Run with custom configuration
docker run -it --rm \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/output:/app/output \
  alsania/scrypgen:latest generate "Create a Python script" --output /app/output/script.py
```

### Building Custom Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    bash \
    git \
    build-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S scrypgen -u 1001

# Change ownership
RUN chown -R scrypgen:nodejs /app
USER scrypgen

# Expose port (if using web interface)
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["npm", "start"]
```

```bash
# Build the image
docker build -t scrypgen-custom .

# Run the container
docker run -it --rm scrypgen-custom
```

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  scrypgen:
    build: .
    container_name: scrypgen
    volumes:
      - ./config:/app/config
      - ./output:/app/output
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=INFO
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "npm", "run", "health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f scrypgen

# Stop the service
docker-compose down
```

## System Integration

### Nemo File Manager Integration

```bash
# Setup Nemo actions directory
make setup-nemo

# Generate Nemo action files
scrypgen generate "Compress files" --integrations nemo --output nemo_actions/

# Install actions
cp nemo_actions/*.nemo_action ~/.local/share/nemo/actions/

# Restart Nemo
nemo --quit
```

### KDE Connect Integration

```bash
# Setup KDE Connect configuration
make setup-kde

# Generate KDE commands
scrypgen generate "System monitor" --integrations kde --output kde_commands/

# Install commands
cp kde_commands/*.json ~/.config/kdeconnect/
```

### VS Code Extension Integration

```bash
# Generate VS Code snippets
scrypgen generate "Python boilerplate" --integrations vscode --output vscode_snippets/

# Install snippets
cp vscode_snippets/*.code-snippets ~/.vscode/snippets/
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key configuration options:

```bash
# Application settings
NODE_ENV=production
LOG_LEVEL=INFO
DEBUG=false

# Paths
OUTPUT_DIR=/var/scrypgen/output
CONFIG_DIR=/etc/scrypgen

# Security
MAX_EXECUTION_TIME=300
SECURITY_VALIDATION=true

# Performance
MAX_CONCURRENT=8
MEMORY_LIMIT=1024
```

### Configuration Files

ScrypGen supports multiple configuration formats:

- **Environment variables** (highest priority)
- **JSON configuration files**
- **YAML configuration files**
- **Command-line arguments**

Example JSON configuration:

```json
{
  "app": {
    "name": "ScrypGen",
    "version": "1.0.0",
    "environment": "production"
  },
  "logging": {
    "level": "INFO",
    "file": "/var/log/scrypgen.log",
    "maxSize": "10m",
    "maxFiles": 5
  },
  "paths": {
    "output": "/var/scrypgen/output",
    "temp": "/tmp/scrypgen",
    "config": "/etc/scrypgen"
  },
  "integrations": {
    "nemo": {
      "enabled": true,
      "actionsDir": "~/.local/share/nemo/actions"
    },
    "kde": {
      "enabled": true,
      "configDir": "~/.config/kdeconnect"
    },
    "vscode": {
      "enabled": true,
      "extensionsDir": "~/.vscode/extensions"
    }
  }
}
```

## Monitoring and Maintenance

### Health Checks

```bash
# Run health check
scrypgen health

# Check system status
make health

# Monitor logs
tail -f /tmp/scrypgen.log
```

### Log Management

```bash
# View recent logs
scrypgen logs --tail 100

# Rotate logs
logrotate /etc/logrotate.d/scrypgen

# Archive old logs
find /var/log/scrypgen -name "*.log" -mtime +30 -delete
```

### Backup and Recovery

```bash
# Create backup
scrypgen backup --output /backup/scrypgen-$(date +%Y%m%d).tar.gz

# Restore from backup
scrypgen restore --input /backup/scrypgen-20231201.tar.gz

# Automated backup (cron job)
echo "0 2 * * * /usr/local/bin/scrypgen backup --output /backup/scrypgen-\$(date +\%Y\%m\%d).tar.gz" | crontab -
```

### Performance Monitoring

```bash
# Enable metrics
export METRICS_ENABLED=true
export METRICS_ENDPOINT=http://localhost:9090

# View performance stats
scrypgen metrics

# Profile execution
scrypgen generate "Complex script" --profile --output profiled_script.sh
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
make clean
npm cache clean --force
make build

# Check Node.js version
node --version
npm --version
```

#### 2. Permission Errors

```bash
# Fix permissions
sudo chown -R $USER:$USER /path/to/scrypgen
chmod +x /path/to/scrypgen/bin/*

# Run with sudo if necessary
sudo scrypgen generate "test script"
```

#### 3. Integration Issues

```bash
# Test integrations
scrypgen test-integrations

# Reinstall integrations
make setup-all

# Check integration logs
scrypgen logs --filter integrations
```

#### 4. Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Monitor memory usage
scrypgen generate "large script" --memory-limit 2048
```

#### 5. Network Issues

```bash
# Test connectivity
curl -I https://registry.npmjs.org/

# Configure proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Use local registry
npm config set registry http://localhost:4873/
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export DEBUG=true

# Run with verbose output
scrypgen generate "test script" --verbose --debug

# Generate debug report
scrypgen debug-report --output debug_report.json
```

### Getting Help

```bash
# Show help
scrypgen --help
make help

# Show version info
scrypgen --version

# Check system compatibility
scrypgen doctor

# Generate support bundle
scrypgen support-bundle --output support.tar.gz
```

## Security Considerations

### Production Security

```bash
# Run as non-root user
adduser scrypgen
su - scrypgen

# Set proper permissions
chmod 755 /usr/local/bin/scrypgen
chmod 644 /etc/scrypgen/config.json

# Enable security features
export SECURITY_VALIDATION=true
export MAX_EXECUTION_TIME=60
```

### Audit Logging

```bash
# Enable audit logging
export AUDIT_LOGGING=true
export AUDIT_LOG_DIR=/var/log/scrypgen/audit

# View audit logs
scrypgen audit --tail 50

# Search audit logs
scrypgen audit --search "generate" --since "2023-12-01"
```

## Advanced Deployment

### Load Balancing

```nginx
# nginx.conf
upstream scrypgen_backend {
    server scrypgen1:3000;
    server scrypgen2:3000;
    server scrypgen3:3000;
}

server {
    listen 80;
    server_name scrypgen.company.com;

    location / {
        proxy_pass http://scrypgen_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### High Availability

```bash
# Systemd service for HA
cat > /etc/systemd/system/scrypgen.service << EOF
[Unit]
Description=ScrypGen Script Generator
After=network.target

[Service]
Type=simple
User=scrypgen
Group=scrypgen
WorkingDirectory=/opt/scrypgen
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl enable scrypgen
systemctl start scrypgen
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy ScrypGen

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Deploy to production
      run: |
        scp scrypgen-*.tgz user@production-server:/tmp/
        ssh user@production-server 'cd /tmp && npm install -g scrypgen-*.tgz'
```

---

## Support

For additional support:

- **Documentation**: https://docs.scrypgen.alsania.dev
- **Issues**: https://github.com/alsania-dev/ScrypGen/issues
- **Discussions**: https://github.com/alsania-dev/ScrypGen/discussions

**Alsania Protocol v1.0** - Built by Sigma, Powered by Echo