from celery import shared_task
from api.models import PhoneNumber
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import requests, json
import threading
from django.db import transaction
from openpyxl import load_workbook
from django.http import JsonResponse
from django.utils import timezone
from ..models import MessageLog
import django
django.setup()

logger = logging.getLogger(__name__)


@shared_task
def send_message_to_facebook_excel_normal(
    excel, template_name, user_id, phone_number_id, bearer_token
):
    try:
        logger.info("Excel Data: %s", excel)
        results = []
        # excel_data = pd.read_json(excel_data_json)
        for value in excel:
            raw_number = str(value).replace(" ", "")
            if raw_number and (raw_number.startswith("91")) and (len(raw_number) == 12):
                raw_number = "+" + raw_number
            elif raw_number and raw_number.startswith("0"):
                raw_number = "+91" + raw_number[1:]
            print(raw_number)

            if raw_number:
                # PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

                data = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": raw_number,
                    "type": "template",
                    "template": {"name": template_name, "language": {"code": "en"}},
                }

                url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
                headers = {
                    "Authorization": "Bearer " + bearer_token,
                    "Content-Type": "application/json",
                }

                try:
                    response = requests.post(url, headers=headers, json=data)
                    response_data = response.json()
                    results.append(response_data)
                except json.JSONDecodeError:
                    pass
        return "None"

        # return results
    except Exception as e:
        # logger.exception("An error occurred in send_message_to_facebook task: %s", e)
        # print("dscjbjhb")

        raise e


@shared_task
def send_message_to_facebook_excel_images(
    excel,
    template_name,
    user_id,
    phone_number_id,
    bearer_token,
    image_link_get,
    template_format,
):
    def process_number(
        value,
        user_id,
        template_name,
        template_format,
        phone_number_id,
        bearer_token,
        results,
    ):
        raw_number = str(value).replace(" ", "")
        if raw_number and (raw_number.startswith("91")) and (len(raw_number) == 12):
            raw_number = "+" + raw_number
        elif raw_number and raw_number.startswith("0"):
            raw_number = "+91" + raw_number[1:]
        # print(raw_number)

        if raw_number:
            # with transaction.atomic():
            # PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

            data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": raw_number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "en"},
                    **(
                        {
                            "components": [
                                {
                                    "type": "header",
                                    "parameters": [
                                        {
                                            "type": template_format,
                                            template_format: {
                                                "link": image_link_get,
                                                **(
                                                    {"filename": f"{template_name}.pdf"}
                                                    if template_format == "document"
                                                    else {}
                                                ),
                                            },
                                        }
                                    ],
                                }
                            ],
                        }
                        if template_format != "text"
                        else {}
                    ),
                },
            }
            url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
            headers = {
                "Authorization": "Bearer " + bearer_token,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()
                results.append(response_data)
                # print(results)
            except json.JSONDecodeError:
                print("JSON Decode Error")

    try:
        # logger.info("Excel Data: %s", excel)
        results = []
        threads = []

        for value in excel:
            thread = threading.Thread(
                target=process_number,
                args=(
                    value,
                    user_id,
                    template_name,
                    template_format,
                    phone_number_id,
                    bearer_token,
                    results,
                ),
            )
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        return results
    except Exception as e:
        logger.exception("An error occurred in send_message_to_facebook task: %s", e)
        raise e



@shared_task
def send_message_to_facebook_array(
    numbers,
    template_name,
    user_id,
    phone_number_id,
    bearer_token,
    media_link_get,
    template_format,
):

    def process_number(
        raw_number,
        template_name,
        template_format,
        phone_number_id,
        bearer_token,
        media_link_get,
        results,
    ):
        # Sanitize the phone number
        raw_number = str(raw_number).replace(" ", "")

        if raw_number and not raw_number.startswith("+"):
            raw_number = "+" + raw_number

        if raw_number:
            # Prepare the payload for WhatsApp API
            data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": raw_number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "en"},
                },
            }

            # Only add components for non-text formats
            if template_format != "text":
                if template_format == "document":
                    data["template"]["components"] = [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "document",
                                    "document": {
                                        "link": media_link_get,
                                        "filename": f"{template_name}.pdf",
                                    },
                                }
                            ],
                        }
                    ]
                elif template_format == "image":
                    data["template"]["components"] = [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "image",
                                    "image": {
                                        "link": media_link_get,
                                    },
                                }
                            ],
                        }
                    ]
                elif template_format == "video":
                    data["template"]["components"] = [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "video",
                                    "video": {
                                        "link": media_link_get,
                                    },
                                }
                            ],
                        }
                    ]

            # Send the POST request
            url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
            headers = {
                "Authorization": "Bearer " + bearer_token,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()
                results.append(response_data)
                print(f"Responses for {raw_number}: {response_data}")

                # Log successful message into the database
              
                try:
                   
                    if "messages" in response_data and response_data["messages"]:
                       
                        message_id = response_data["messages"][0].get("id")
                       
                        if message_id:
                            # Wrap the database operation in a transaction block
                           
                            with transaction.atomic():
                               
                                MessageLog.objects.create(
                                    template_name=template_name,
                                    template_id=message_id,
                                    phone_number=raw_number,
                                    date_sent=timezone.now()
                                )
                                print(f"Message log created for {raw_number}")
                except Exception as db_error:
                    print(f"Database logging error for {raw_number}: {db_error}")

            except requests.RequestException as req_err:
                print(f"Request error for {raw_number}: {req_err}")
            except json.JSONDecodeError:
                print(f"JSON Decode Error for {raw_number}")

    # Task execution logic
    try:
        results = []

        # Process each number in the list
        for number in numbers:
            process_number(
                number,
                template_name,
                template_format,
                phone_number_id,
                bearer_token,
                media_link_get,
                results,
            )

        return results
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e

@shared_task
def send_personalized_messages(
    excel_file_path, template_name, phone_number_id, bearer_token, user_id
):
    workbook = load_workbook(excel_file_path, read_only=True)
    worksheet = workbook.active
    results = []

    for row in worksheet.iter_rows(values_only=True):
        raw_number = str(row[0])
        name = str(row[1])

        if raw_number.startswith("0"):
            raw_number = "+91" + raw_number[1:]

        if not raw_number.startswith("+91"):
            raw_number = "+91" + raw_number

        # PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": raw_number,
            "type": "template",
            "template": {
                "name": template_name,
                "components": [
                    {"type": "HEADER", "parameters": [{"type": "text", "text": name}]}
                ],
                "language": {"code": "en"},
            },
        }

        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            response_data = response.json()
            results.append(response_data)

        except json.JSONDecodeError:
            results.append({"error": "Invalid JSON data"})
    return results


@shared_task
def send_message_to_facebook_custom(
    message,
    numbers,
    phone_number_id,
    bearer_token,
):
    def process_number(message, value, phone_number_id, bearer_token, results):
        raw_number = str(value).replace(" ", "")
        if raw_number and raw_number.startswith("91") and len(raw_number) == 12:
            raw_number = "+" + raw_number
        elif raw_number and raw_number.startswith("0"):
            raw_number = "+91" + raw_number[1:]

        # Build the base message data
        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": raw_number,
        }

        # Adjust the message structure based on template_format
        if template_format == "text":
            data["type"] = "text"
            data["text"] = {"preview_url": True, "body": message}
        elif template_format == "image":
            data["type"] = "image"
            data["image"] = {"link": media_url}
        elif template_format == "video":
            data["type"] = "video"
            data["video"] = {"link": media_url}
        elif template_format == "document":
            data["type"] = "document"
            data["document"] = {"link": media_url}
        elif template_format == "custom":
            # Add custom handling logic here based on your needs
            data["type"] = "custom"
            # custom data goes here, if applicable
            pass

        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        headers = {
            "Authorization": "Bearer " + bearer_token,
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            response_data = response.json()
            results.append(response_data)
            print(response_data)
        except json.JSONDecodeError:
            print("JSON Decode Error")

    try:
        results = []
        threads = []

        for value in numbers:
            thread = threading.Thread(
                target=process_number,
                args=(message, value, phone_number_id, bearer_token, results),
            )
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        return results
    except Exception as e:
        logger.exception("An error occurred in send_message_to_facebook task: %s", e)
        raise e


@shared_task
def send_email(email, password):
    my_subject = "Whatsapp Module Generated Password"
    context = {
        "password": password,
    }
    recipient_list = [email]
    html_message = render_to_string("password.html", context)
    plain_message = strip_tags(html_message)
    message = EmailMultiAlternatives(
        subject=my_subject,
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipient_list,
    )
    message.attach_alternative(html_message, "text/html")
    message.send()
    # return None

