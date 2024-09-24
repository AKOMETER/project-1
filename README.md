# install redis

# on mac // start redis

brew services start redis

# Start Application

```bash
# terminal one
// make sure sql or database connection is open
cd backend
source venv/bin/activate
python manage.py runserver

#terminal two
cd frontend
npm run start

#terminal three
cd backend
source venv/bin/activate

 #start celery on console

 celery -A whatsapp_back worker --loglevel=info
 or
 celery -A whatsapp_back worker --loglevel=debug
```

# Using Docker

1.  make sure you .env files are present in root and ./backend
2.  run docker deamon on background (just start the docket app)
3.  docker pull mysql:5.7
4.  docker pull redis:alpine
5.  docker-compose up --build
