# install redis

start redis
start celery on console

```bash
celery -A whatsapp_back worker --loglevel=info
or
celery -A whatsapp_back worker --loglevel=debug
```
