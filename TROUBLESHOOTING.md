# 🔧 Troubleshooting Guide - Universal CRUD Template

## 🚀 **Quick Fixes for Common Issues**

### **🎯 First Time Setup Problems**

#### Issue: "Command not found" or "Script not recognized"
**Solutions:**
```powershell
# For PowerShell execution policy issues:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternative: Use Command Prompt instead
# Double-click LAUNCH.bat instead of LAUNCH.ps1
```

#### Issue: Port already in use (3000, 5173, 8080, 5000)
**Solutions:**
```powershell
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :8080

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or use different ports in your .env files
```

---

### **🗄️ Database Connection Issues**

#### MySQL Problems
**Solutions:**
1. **Install MySQL:**
   - Download: https://dev.mysql.com/downloads/installer/
   - Or Chocolatey: `choco install mysql`

2. **Start MySQL Service:**
   ```powershell
   net start mysql
   # Or through Services: Win+R → services.msc → MySQL → Start
   ```

3. **Create Database and User:**
   ```sql
   CREATE DATABASE crud_app;
   CREATE USER 'crud_user'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON crud_app.* TO 'crud_user'@'localhost';
   ```

#### PostgreSQL Problems
**Solutions:**
1. **Install PostgreSQL:**
   - Download: https://www.postgresql.org/download/
   - Or Chocolatey: `choco install postgresql`

2. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE crud_app;
   CREATE USER crud_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE crud_app TO crud_user;
   ```

---

### **🟢 Node.js Backend Issues**

#### npm install fails
**Solutions:**
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Use different registry if needed
npm install --registry https://registry.npmjs.org/
```

#### bcrypt installation fails (Windows)
**Solutions:**
```powershell
# Install build tools
npm install --global windows-build-tools

# Or use bcryptjs (already configured as fallback)
npm uninstall bcrypt
npm install bcryptjs
```

#### JWT_SECRET missing
**Solution:**
```powershell
# Copy .env.example to .env and edit
copy .env.example .env
# Then edit .env with your values
```

---

### **☕ Java Spring Boot Issues**

#### Java version problems
**Solutions:**
```powershell
# Check Java version (need 17+)
java -version

# Download Java 17+ from: https://adoptium.net/
# Set JAVA_HOME in System Environment Variables
```

#### Maven dependencies won't download
**Solutions:**
```powershell
# Clean and reinstall
mvn clean install

# Force update
mvn clean install -U

# Clear local repository if needed
Remove-Item -Recurse -Force ~/.m2/repository
mvn clean install
```

---

### **🐍 Python Flask Issues**

#### pip install fails
**Solutions:**
```powershell
# Create virtual environment
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip

# Install dependencies
pip install -r requirements_new.txt

# If specific packages fail:
pip install --upgrade setuptools wheel
```

#### Python version issues
**Solutions:**
```powershell
# Check Python version (need 3.8+)
python --version

# Download from: https://www.python.org/downloads/
```

---

### **🐘 PHP Issues**

#### PHP not found
**Solutions:**
```powershell
# Install PHP
# Download: https://windows.php.net/download/
# Or Chocolatey: choco install php

# Add PHP to PATH environment variable
```

#### PDO extension not loaded
**Solutions:**
1. Edit `php.ini`:
   ```ini
   extension=pdo
   extension=pdo_mysql
   extension=pdo_sqlite
   ```
2. Restart web server

---

### **⚛️ React Issues**

#### npm start fails
**Solutions:**
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Alternative: Use Yarn
yarn install
yarn dev
```

#### Module not found errors
**Solutions:**
```powershell
# Install missing dependencies
npm install @tanstack/react-query axios react-router-dom

# For TypeScript errors
npm install --save-dev @types/node
```

---

### **🅰️ Angular Issues**

#### ng command not found
**Solutions:**
```powershell
# Install Angular CLI globally
npm install -g @angular/cli

# Or use npx (no global install needed)
npx @angular/cli serve
```

#### Angular Material not working
**Solutions:**
```powershell
# Install Angular Material
ng add @angular/material

# Import required modules in app.module.ts
```

---

### **🌐 CORS and API Issues**

#### CORS errors in browser
**Solutions:**
1. **Backend CORS is already configured**
2. **Check API URLs in frontend:**
   ```javascript
   // Make sure this matches your backend port
   const API_URL = 'http://localhost:3000/api';
   ```

#### 404 API errors
**Solutions:**
1. **Verify backend is running on correct port**
2. **Check API endpoint URLs**
3. **Test with curl:**
   ```powershell
   curl http://localhost:3000/api/products
   ```

---

### **🔐 Authentication Issues**

#### JWT tokens not working
**Solutions:**
1. **Check token expiration (1 hour default)**
2. **Verify JWT_SECRET matches between frontend/backend**
3. **Clear localStorage and login again:**
   ```javascript
   localStorage.clear();
   ```

#### Login fails
**Solutions:**
1. **Check database has test users**
2. **Verify password hashing is working**
3. **Check browser network tab for actual error**

---

### **📊 Testing the Setup**

#### Quick Health Check
```powershell
# Test each service individually:

# 1. Backend API
curl http://localhost:3000/api/health

# 2. Database connection
curl http://localhost:3000/api/products

# 3. Frontend
# Open http://localhost:5173 in browser

# 4. Authentication
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'
```

---

### **🆘 Emergency Reset**

**If everything is broken:**

```powershell
# Navigate to main directory
cd c:\Users\bever\crud

# Full reset script
Remove-Item -Recurse -Force */node_modules, */package-lock.json
Remove-Item -Recurse -Force */venv, */__pycache__
Remove-Item -Recurse -Force */target  # Java

# Then use LAUNCH script to start fresh
.\LAUNCH.bat
```

---

### **💡 Pro Tips**

1. **Always check the console logs first** (F12 in browser)
2. **Verify all required services are running**
3. **Test one component at a time**
4. **Use the provided startup scripts instead of manual commands**
5. **Check environment variables in .env files**

### **🔍 Log Locations**
- **Browser Console:** F12 → Console tab
- **Backend Logs:** Terminal where server is running  
- **Database Logs:** Check MySQL/PostgreSQL service logs
- **Build Logs:** Terminal during npm install/build

---

### **📞 Still Stuck?**

If none of these solutions work:

1. **Take a screenshot of the exact error**
2. **Note which technology stack you're using**
3. **List what commands you ran before the error**
4. **Check if you're using the latest version of the template**

**Most common causes:**
- ❌ Missing dependencies  
- ❌ Wrong Node.js/Java/Python version
- ❌ Database not running
- ❌ Port conflicts
- ❌ Incorrect environment variables
- ❌ Firewall blocking ports

**✅ The LAUNCH script handles most of these automatically!**
- Backend: Edit `PORT=3000` in `.env` file
- Frontend: Vite will automatically find next available port

### 4. Database Connection Issues

**For MySQL (recommended for testing):**
1. Install XAMPP or standalone MySQL
2. Start MySQL service
3. Import schema: `database/mysql/schema.sql`
4. Update `.env` file:
   ```
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=universal_crud
   DB_USER=root
   DB_PASSWORD=
   ```

**For PostgreSQL:**
1. Install PostgreSQL
2. Create database and user
3. Import schema: `database/postgresql/schema.sql`
4. Update `.env` file with PostgreSQL settings

### 5. Dependencies Issues

**If npm install fails:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

**Node.js version compatibility:**
- Minimum: Node.js 14.x
- Recommended: Node.js 18.x or higher
- Check version: `node --version`

### 6. CORS Issues

If frontend can't connect to backend:
1. Make sure both servers are running
2. Check `.env` file has correct CORS origins:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4200
   ```
3. Frontend API URL should match backend port (check `src/lib/api.js`)

### 7. Authentication Issues

**JWT Token problems:**
1. Check JWT_SECRET in `.env` file is set
2. Clear browser localStorage if testing
3. Check network tab for 401/403 errors

### 8. Build Issues

**React build fails:**
```powershell
cd frontend/react
npm run build
```

If build fails, check for:
- Missing dependencies
- Import/export errors
- Environment variable issues

### 9. Testing the Application

**Quick Test Steps:**
1. Start both servers (backend + frontend)
2. Open browser to http://localhost:5173
3. Try to register a new user
4. Login with the registered user
5. Create a product, category, etc.

**API Testing:**
Use Postman or curl to test endpoints:
```bash
# Test server health
curl http://localhost:3000/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password"}'
```

### 10. Environment Variables

**Backend (.env file):**
```env
PORT=3000
NODE_ENV=development
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=universal_crud
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Frontend (optional .env file):**
```env
VITE_API_URL=http://localhost:3000/api
```

### 11. File Structure Verification

Your directory should look like:
```
c:\Users\bever\crud\
├── backend\
│   ├── node-express\
│   ├── python-flask\
│   └── php\
├── frontend\
│   └── react\
├── database\
│   ├── mysql\
│   └── postgresql\
├── start.bat
├── start.ps1
└── README.md
```

### 12. Performance Issues

**If the app is slow:**
1. Check database connection
2. Verify Node.js version (use latest LTS)
3. Clear browser cache
4. Check for console errors in browser dev tools

### 13. Production Deployment

**Building for production:**
```powershell
# Frontend
cd frontend/react
npm run build

# Backend (already production ready)
cd backend/node-express
npm start
```

### 14. Getting Help

**Check these files for more info:**
- `backend/node-express/README.md` - Backend API documentation
- `frontend/react/README.md` - Frontend component guide
- `TEST_RESULTS.md` - Test results and validation
- `FINAL_TEST_REPORT.md` - Complete test report

**Common Error Messages:**

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` |
| "Port already in use" | Change port in .env or kill process |
| "Database connection failed" | Check database server and credentials |
| "CORS error" | Check ALLOWED_ORIGINS in .env |
| "401 Unauthorized" | Check JWT token and authentication |

### 15. Success Indicators

**You know it's working when:**
- ✅ Backend starts on http://localhost:3000
- ✅ Frontend starts on http://localhost:5173
- ✅ No console errors in browser
- ✅ You can register and login
- ✅ CRUD operations work (create, read, update, delete)
- ✅ Database shows created records

---

## 🆘 Still Having Issues?

1. **Check the console outputs** for specific error messages
2. **Verify Node.js version** is 14+ with `node --version`
3. **Ensure all dependencies are installed** with `npm install`
4. **Check database connection** and credentials
5. **Use the start scripts** for automatic setup

The template has been fully tested and should work out of the box! 🚀
