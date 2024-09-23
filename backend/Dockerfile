# Use Python 3.8 image
FROM python:3.8

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt /app/

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project to the container
COPY . /app/

# Expose the port Django will run on
EXPOSE 8000

# Run the command to start Gunicorn, serving the Django application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "whatsapp_back.wsgi:application"]
