import os
import logging
from celery import Celery

# Set up Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "whatsapp_back.settings")

# Create a Celery instance
app = Celery("whatsapp_back")

# Configure Celery timezone
app.conf.timezone = "Asia/Kolkata"

# Load Celery settings from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover tasks in the Django app
app.autodiscover_tasks()

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

@app.task(bind=True)
def debug_task(self):
    logger.info(f"Request: {self.request!r}")

