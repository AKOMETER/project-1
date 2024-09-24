# Use Python 3.8 image
FROM python:3.8

# Set the working directory in the container
WORKDIR /app

# Copy only the requirements file
COPY requirements.txt /app/


# Upgrade pip and install dependencies
RUN pip install --upgrade pip
# RUN pip install --no-cache-dir --timeout=1000 -r requirements.txt
RUN pip install --timeout=1000 -r requirements.txt --index-url https://pypi.org/simple


# Copy the rest of the Django project
COPY . /app/

# Expose the port Django will run on
EXPOSE 8000

# Run the command to start Gunicorn, serving the Django application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "whatsapp_back.wsgi:application"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]