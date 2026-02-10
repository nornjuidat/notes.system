# User Notes System (DevOps-ready)

A mini full-stack app:
- Register / Login
- Personal notes per user (CRUD)
- SQLite database (file-based)
- JWT stored in HttpOnly cookie
- CSRF protection
- Simple modern UI (EJS + CSS)
- Ready for Linux server (SSH) + PM2 + Nginx (optional)

## Local run
```bash
cp .env.example .env
npm install
npm run migrate
npm start
# open http://localhost:3000
```

## Deploy on server (SSH)
```bash
sudo apt update
sudo apt install -y git nodejs npm
git clone <YOUR_REPO_URL>
cd user-notes-system
cp .env.example .env
nano .env  # set JWT_SECRET
npm install
npm run migrate
npm start
```

## Run with PM2 (recommended)
```bash
sudo npm i -g pm2
pm2 start server.js --name user-notes
pm2 save
pm2 startup
```

## Nginx (optional)
See `deploy/nginx-user-notes.conf`
