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

1. make sure you .env files are present
2. ```bash
   docker-compose up --build
   ```

```

```
