# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Format code: `npm run format`
- [ ] Run tests: `npm run test`
- [ ] Check for console.log statements (use logger instead)
- [ ] Review error handling
- [ ] Validate input sanitization

### 2. Security Review
- [ ] JWT_SECRET is strong (minimum 32 characters)
- [ ] MongoDB has authentication enabled
- [ ] CORS is properly configured
- [ ] All sensitive data is in environment variables
- [ ] No credentials in code or git
- [ ] HTTPS is enforced
- [ ] CSRF protection if needed
- [ ] Rate limiting is enabled

### 3. Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with appropriate permissions
- [ ] Backup strategy configured
- [ ] Indexes are created
- [ ] Connection pooling configured

### 4. Email Configuration
- [ ] Gmail/Email account setup
- [ ] App-specific password generated
- [ ] Email templates verified
- [ ] Bounce handling configured

### 5. API Keys & Secrets
- [ ] Google Gemini API key obtained
- [ ] API rate limits understood
- [ ] API quotas monitored
- [ ] Fallback strategies implemented

## Deployment Steps

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku app**
```bash
heroku create your-app-name
```

4. **Add Procfile**
```
web: node src/app.js
```

5. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=mongodb://...
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASSWORD=your-password
heroku config:set GEMINI_API_KEY=your-api-key
```

6. **Deploy**
```bash
git push heroku main
```

7. **View logs**
```bash
heroku logs --tail
```

### Option 2: AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - Configure security groups (open ports 80, 443)
   - Create and download key pair

2. **SSH into instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Node.js and dependencies**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git nginx
```

4. **Clone repository**
```bash
cd /home/ubuntu
git clone your-repo-url backend-my-spends
cd backend-my-spends
```

5. **Install dependencies**
```bash
npm install --production
```

6. **Configure environment**
```bash
cp .env.example .env
nano .env  # Add your credentials
```

7. **Install and configure PM2**
```bash
sudo npm install -g pm2
pm2 start src/app.js --name "spendSense"
pm2 startup
pm2 save
```

8. **Configure Nginx reverse proxy**
```bash
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Enable SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

10. **Restart Nginx**
```bash
sudo systemctl restart nginx
```

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean account**
2. **Connect GitHub repository**
3. **Configure app settings:**
   - Runtime: Node.js
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: Add .env values

4. **Deploy**
   - Click "Create App"
   - Deployment starts automatically

### Option 4: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Build image**
```bash
docker build -t spendSense-backend .
```

3. **Run container**
```bash
docker run -d \
  --name spendSense \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=your-secret \
  spendSense-backend
```

## Post-Deployment

### 1. Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation (ELK Stack)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors

### 2. Performance Monitoring
- [ ] Monitor response times
- [ ] Track API usage
- [ ] Monitor database performance
- [ ] Set up auto-scaling if needed

### 3. Backup Strategy
- [ ] Daily MongoDB backups
- [ ] Test backup restoration
- [ ] Store backups in multiple locations
- [ ] Document recovery procedures

### 4. Security Hardening
- [ ] Enable WAF (Web Application Firewall)
- [ ] Set up DDoS protection
- [ ] Enable database encryption
- [ ] Implement API key rotation
- [ ] Enable audit logging

### 5. Documentation
- [ ] Document deployment process
- [ ] Document rollback procedures
- [ ] Document monitoring setup
- [ ] Create runbooks for common issues

## Scaling Strategies

### Horizontal Scaling
1. Use load balancer (AWS ELB, Nginx)
2. Run multiple instances
3. Use sticky sessions if needed
4. Implement session persistence in Redis

### Vertical Scaling
1. Increase server resources
2. Optimize database queries
3. Implement caching (Redis)
4. Optimize code performance

### Database Scaling
1. Use MongoDB Atlas auto-scaling
2. Implement read replicas
3. Use connection pooling
4. Archive old transaction data

## Troubleshooting

### Common Issues

**High Memory Usage**
```bash
node --max-old-space-size=4096 src/app.js
```

**Database Connection Errors**
- Check MongoDB URI
- Verify IP whitelist in MongoDB Atlas
- Check connection pool size

**Slow API Responses**
- Check database indexes
- Monitor network latency
- Profile slow queries
- Implement caching

**Email Not Sending**
- Verify SMTP credentials
- Check email provider settings
- Review email logs
- Test with test account

## Performance Targets

- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- Error rate: < 0.1%
- Uptime: 99.9%

## Rollback Procedure

1. **Database:**
   ```bash
   # Restore from backup
   mongorestore --uri mongodb+srv://... backup/
   ```

2. **Application:**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push
   # Redeploy
   ```

3. **Verify:**
   - Check application logs
   - Test critical endpoints
   - Monitor error rates
