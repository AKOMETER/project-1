from django.conf import settings
import requests, json, threading
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .serializers import (
    PhoneNumberSerializer,
    ExcelSerializer,
    ExcelImageSerializer,
    WhatsAppBulkMessageSerializer,
    WhatsAppBulkMessageImageSerializer,
    MessageTemplateSerializer,
    MessageTextTemplateSerializer,
    ImageUploadSerializer,
    CustomUserSerializer,
    CustomUserDetailSerializer,
    CredentialsSerializer,
    UserLoginSerializer,
    ReferalStringSerializer,
    ScheduledAPISerializer,
    ContactFormSerializer,
    PlanPurchaseSerializer,
    ContactGroupSerializer,
    CustomMessageSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    PhoneNumber,
    CustomUser,
    WhatsappCredential,
    Template,
    ScheduledAPICall,
    ContactForm,
    Notification,
    PlanPurchase,
    ContactGroup,
)

# from openpyxl import load_workbook
from decouple import config
from django.contrib.auth import authenticate
import urllib.parse
import base64, os, random, string, jwt
from .functions.trial_notifications import check_trial_period
from .functions.tasks import (
    send_message_to_facebook_excel_normal,
    send_email,
    send_message_to_facebook_excel_images,
    send_message_to_facebook_array,
    send_personalized_messages,
    send_message_to_facebook_custom,
)
import pandas as pd
from datetime import datetime


def read_file(file_path):
    file_name = file_path.name
    print(file_path)
    if file_name.endswith(".csv"):
        data = pd.read_csv(file_path)
    elif file_name.endswith(".xlsx"):
        data = pd.read_excel(file_path)
    else:
        data = None
    if isinstance(data, pd.DataFrame) and not data.empty:
        first_column_values = data.iloc[:, 0].tolist()
        return first_column_values
    else:
        return None

    return data


my_token = "your_verify_token"
bearer_token = config("TOKEN")
phone_number_id = config("PHONE_NO_ID")
business_id = config("BUSINESS_ID")
# domain_url = "http://127.0.0.1:8000"
domain_url = "https://altosconnectweb.in"


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    refresh.payload["user_id"] = user.id
    refresh.payload["user_is_staff"] = user.is_staff
    refresh.payload["user_is_distributor"] = user.is_distributor

    return {
        "access": str(refresh.access_token),
    }


def get_credentials(user_id):
    try:
        credentials = WhatsappCredential.objects.filter(user_id=user_id).values(
            "phone_number_id",
            "whatsapp_business_id",
            "permanent_access_token",
            "app_id",
        )
        if credentials:
            return credentials
        else:
            return None
    except WhatsappCredential.DoesNotExist:
        return None


@api_view(["POST"])
# @permission_classes([IsAuthenticated])
def validate_access_token(request):
    user = request.user

    try:
        refresh = RefreshToken.for_user(user)
        refresh.access_token.verify()
        return Response({"valid": True})
    except Exception as e:
        return Response({"valid": False}, status=401)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_credentials(request):
    # print(122)
    if request.method == "POST":
       
        serializer = CredentialsSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data["user_id"]

            try:
                credentials = WhatsappCredential.objects.get(user_id=user_id)
                
                user = CustomUser.objects.get(id=user_id)

                credentials.whatsapp_business_id = serializer.validated_data[
                    "whatsapp_business_id"
                ]
                credentials.permanent_access_token = serializer.validated_data[
                    "permanent_access_token"
                ]
                credentials.phone_number_id = serializer.validated_data[
                    "phone_number_id"
                ]
                credentials.app_id = serializer.validated_data["app_id"]
                credentials.save()
               

            except WhatsappCredential.DoesNotExist:
                user = CustomUser.objects.get(id=user_id)

                WhatsappCredential.objects.create(
                    user=user,
                    phone_number_id=serializer.validated_data["phone_number_id"],
                    whatsapp_business_id=serializer.validated_data[
                        "whatsapp_business_id"
                    ],
                    permanent_access_token=serializer.validated_data[
                        "permanent_access_token"
                    ],
                    app_id=serializer.validated_data[
                        "app_id"
                    ],
                )

            return Response(
                {"message": "Data saved successfully"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            response_data = {
                "message": "User registered successfully",
                "user": serializer.data,
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get("username")
            password = serializer.validated_data.get("password")

            user = serializer.validated_data["user"]
            if (
                user is not None
                and user.is_active
                and user.trial_user
                and self.is_registered_more_than_14_days(user.register_date)
            ):
                token = get_tokens_for_user(user)
                payload = {
                    "basic_feature": user.basic_feature,
                    "standard_feature": user.standard_feature,
                    "advanced_feature": user.advanced_feature,
                }
                secret_key = "whatsapp"
                feature_token = jwt.encode(payload, secret_key, algorithm="HS256")
                check_trial_period(user)
                # print(feature_token)
                return Response(
                    {
                        "message": "Login successful",
                        "token": token,
                        "user_id": user.id,
                        "is_manager": user.is_staff,
                        "is_active": user.is_active,
                        "is_distributor": user.is_distributor,
                        "feature_token": feature_token,
                    },
                    status=status.HTTP_200_OK,
                )
            elif (
                user is not None
                and user.is_active
                and not user.trial_user
                and self.is_registered_more_than_30_days(user.register_date)
            ):
                token = get_tokens_for_user(user)
                payload = {
                    "basic_feature": user.basic_feature,
                    "standard_feature": user.standard_feature,
                    "advanced_feature": user.advanced_feature,
                }
                secret_key = "whatsapp"
                feature_token = jwt.encode(payload, secret_key, algorithm="HS256")
                check_trial_period(user)
                # print(feature_token)
                return Response(
                    {
                        "message": "Login successful",
                        "token": token,
                        "user_id": user.id,
                        "is_manager": user.is_staff,
                        "is_active": user.is_active,
                        "is_distributor": user.is_distributor,
                        "feature_token": feature_token,
                    },
                    status=status.HTTP_200_OK,
                )
            elif user is not None and user.is_active and user.trial_user:
                return Response(
                    {"message": "Trial is expired. Please Contact Us to Continue."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user is not None and user.is_active and not user.trial_user:
                return Response(
                    {"message": "Plan is expired. Please Contact Us to Continue."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                return Response(
                    {"message": "Invalid credentials or inactive account"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        return Response(
            {"message": "Invalid credentials or inactive account"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def is_registered_more_than_14_days(self, register_date):
        register_date = datetime.combine(register_date, datetime.min.time())
        register_date = timezone.make_aware(register_date)
        days_difference = (timezone.now() - register_date).days
        return days_difference < 14

    def is_registered_more_than_30_days(self, register_date):
        register_date = datetime.combine(register_date, datetime.min.time())
        register_date = timezone.make_aware(register_date)
        days_difference = (timezone.now() - register_date).days
        return days_difference < 30


@api_view(["POST"])
def update_register_date(request):
    user_id = request.GET.get("user_id")
    date = request.data.get("startdate")
    user = CustomUser.objects.get(id=user_id)
    user.register_date = date
    user.save()
    return Response("updated")


class UserListView2(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, format=None):
        staff_false_users = CustomUser.objects.filter(is_staff=False, trial_user=False)
        trial_users = CustomUser.objects.filter(is_staff=False, trial_user=True)
        distributor_true_users = CustomUser.objects.filter(is_distributor=True)

        staff_false_serializer = CustomUserSerializer(staff_false_users, many=True)
        trial_serializer = CustomUserSerializer(trial_users, many=True)
        distributor_true_serializer = CustomUserSerializer(
            distributor_true_users, many=True
        )

        response_data = {
            "staff_users": staff_false_serializer.data,
            "distributor_users": distributor_true_serializer.data,
            "trial_users": trial_serializer.data,
        }

        return Response(response_data)


class UserDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserDetailSerializer


class UserChildrenListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        parent_user_id = self.kwargs.get("pk")

        if parent_user_id:
            children = CustomUser.objects.filter(parent_user_id=parent_user_id)
            data = [
                {"id": child.id, "email": child.email, "is_active": child.is_active}
                for child in children
            ]
            return Response(data)
        else:
            return Response([])


class UserHierarchyView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        user_id = self.kwargs.get("pk")
        user = CustomUser.objects.get(pk=user_id)
        hierarchy_data = self.get_user_hierarchy(user)
        return Response(hierarchy_data)

    def get_user_hierarchy(self, user):
        return self.build_hierarchy(user)

    def build_hierarchy(self, user):
        user_data = {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "is_distributor": user.is_distributor,
            "children": [],
        }

        children = CustomUser.objects.filter(parent_user=user)
        for child in children:
            user_data["children"].append(self.build_hierarchy(child))

        return user_data

    def get_user_descendants(self, parent_user_id):
        descendants = []
        children = CustomUser.objects.filter(parent_user_id=parent_user_id)

        for child in children:
            descendants.append(child)
            descendants.extend(self.get_user_descendants(child.id))

        return descendants


class ViewReferralStringAPIView(APIView):
    def get(self, request, user_id):
        user = CustomUser.objects.get(id=user_id)
        serializer = ReferalStringSerializer(user)
        return Response(serializer.data)

    def put(self, request, user_id):
        user = CustomUser.objects.get(id=user_id)
        serializer = ReferalStringSerializer(user, data=request.data)
        if serializer.is_valid():
            refer = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            serializer.validated_data["referral_string"] = refer
            # print(refer)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class EditReferralStringAPIView(APIView):
import magic
from concurrent.futures import ThreadPoolExecutor


# import aiohttp
# import aiofiles
# import asyncio
@api_view(["POST"])
def upload_image(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
   
    bearer_token = get_credential[0]["permanent_access_token"]
    
    app_id = get_credential[0]["app_id"]
    user_access_token = request.data.get("access_token")
    uploaded_file = request.data.get("template_image")
    
    template_name = request.data.get("template_name")
    file_length = uploaded_file.size
    
    file_type = magic.from_buffer(uploaded_file.read(1024), mime=True)
   
    # file_length = request.data.get("file_length")
    # file_type = request.data.get("file_type")
    # image_file = request.FILES.get("image_file")

    # Step 1: Create a Session
    uploaded_file.seek(0)

    url1 = f"https://graph.facebook.com/v19.0/{app_id}/uploads"
    headers1 = {"Content-Type": "application/x-www-form-urlencoded"}
    print(90)
    params1 = {
        "file_length": file_length,
        "file_type": file_type,
        "access_token": bearer_token,
    }

    files = {"file": uploaded_file}

    print(params1)
    response1 = requests.post(url1, headers=headers1, params=params1)
   
    print(response1.json())
    
    if response1.status_code != 200:
        return Response({"error": "Failed to create a session"}, status=500)

    upload_session_id = response1.json().get("id")

    url2 = f"https://graph.facebook.com/v19.0/{upload_session_id}"
    headers2 = {"Authorization": f"OAuth {bearer_token}", "file_offset": "0"}
    files2 = {"file": uploaded_file}
    response2 = requests.post(url2, headers=headers2, files=files2)
    print(response2.json())
    
    # Template name and user should be unique
    template = Template.objects.create(
        template_image=uploaded_file, template_name=template_name, user=request.user
    )
    
    if response2.status_code != 200:
        return Response({"error": "Failed to initiate upload"}, status=500)

    file_handle = response2.json().get("h")

    return Response({"h": file_handle})


# def image_upload(request):
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def upload_image(request):
#     user_id = request.GET.get("user_id")
#     get_credential = get_credentials(user_id)
#     bearer_token = get_credential[0]["permanent_access_token"]
#     app_id = get_credential[0]["app_id"]

#     bearer_token = urllib.parse.quote(bearer_token, safe="")
#     url1 = (
#         f"https://graph.facebook.com/v18.0/{app_id}/uploads?access_token="
#         + bearer_token
#     )

#     # Inspect uploaded file to determine file length and type
#     uploaded_file = request.data.get("template_image")
#     file_length = uploaded_file.size
#     file_type = magic.from_buffer(uploaded_file.read(1024), mime=True)

#     # Add file_length and file_type to the URL
#     url1 += f"&file_length={file_length}&file_type={file_type}"
#     print(url1)

#     response1 = requests.post(url1)

#     if response1.status_code != 200:
#         return JsonResponse(
#             {"error": "Failed to make the first POST request"}, status=500
#         )

#     try:
#         response1_data = response1.json()
#         upload_session_key = response1_data["id"]
#         print(upload_session_key)
#     except ValueError:
#         return JsonResponse({"error": "Invalid JSON in the first response"}, status=500)

#     serializer = ImageUploadSerializer(data=request.data)
#     if serializer.is_valid():
#         image_file = serializer.validated_data["template_image"]
#         template_name = serializer.validated_data["template_name"]
#         content = image_file.read()
#         files = {'source': (uploaded_file.name, uploaded_file)}

#         file_name = os.path.basename(image_file.name)

#         encoded_string = base64.b64encode(content).decode("utf-8")

#         data_url = f"data:image;base64,{encoded_string}"

#         url2 = "https://graph.facebook.com/v18.0/" + upload_session_key
#         headers = {"Authorization": "OAuth " + bearer_token, "file_offset": "0"}

#         files = {"source": data_url}
#         response2 = requests.post(url2, headers=headers, files=files)
#         serializer.save(user=request.user)

#         if response2.status_code != 200:
#             return JsonResponse({"error": response2.json()}, status=500)

#         try:
#             response2_data = response2.json()
#             return JsonResponse(response2_data)
#         except ValueError:
#             return JsonResponse(
#                 {"error": "Invalid JSON in the second response"}, status=500
#             )

#     return JsonResponse({"error": "Invalid data"}, status=400)


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def upload_image(request):
#     user_id = request.GET.get("user_id")
#     get_credential = get_credentials(user_id)
#     bearer_token = get_credential[0]["permanent_access_token"]
#     app_id = get_credential[0]["app_id"]

#     bearer_token = urllib.parse.quote(bearer_token, safe="")
#     url1 = (
#         f"https://graph.facebook.com/v18.0/{app_id}/uploads?access_token="
#         + bearer_token
#         + "&file_length=20000&file_type=image/png"
#     )

#     response1 = requests.post(url1)

#     if response1.status_code != 200:
#         # print(response1.text)
#         return JsonResponse(
#             {"error": "Failed to make the first POST request"}, status=500
#         )

#     try:
#         response1_data = response1.json()
#         # print(response1_data)
#         upload_session_key = response1_data["id"]
#     except ValueError:
#         return JsonResponse({"error": "Invalid JSON in the first response"}, status=500)

#     serializer = ImageUploadSerializer(data=request.data)
#     if serializer.is_valid():
#         image_file = serializer.validated_data["template_image"]
#         template_name = serializer.validated_data["template_name"]
#         content = image_file.read()


#         file_name = os.path.basename(image_file.name)

#         encoded_string = base64.b64encode(content).decode("utf-8")

#         data_url = f"data:image;base64,{encoded_string}"

#         url2 = "https://graph.facebook.com/v18.0/" + upload_session_key
#         headers = {"Authorization": "OAuth " + bearer_token, "file_offset": "0"}

#         # files = {"source": (file_name, open(file_name, "rb"))}
#         files = {"source": data_url}
#         response2 = requests.post(url2, headers=headers, files=files)
#         serializer.save(user=request.user)

#         if response2.status_code != 200:
#             return JsonResponse({"error": response2.json()}, status=500)

#         try:
#             response2_data = response2.json()
#             # print(response2_data)
#             return JsonResponse(response2_data)
#         except ValueError:
#             return JsonResponse(
#                 {"error": "Invalid JSON in the second response"}, status=500
#             )

#     return JsonResponse({"error": "Invalid data"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_template(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    # print(user_id)

    try:
        template_name = request.GET.get("template_name")
        cleaned_string = template_name.replace('"', "")

        url = (
            "https://graph.facebook.com/v18.0/"
            + business_id
            + "/message_templates?name="
            + cleaned_string
        )
        # print(url)
        headers = {
            "Authorization": "Bearer " + bearer_token,
            "Content-Type": "application/json",
        }
        response = requests.request("DELETE", url, headers=headers)
        response_data = response.json()

        template = Template.objects.get(template_name=cleaned_string)
        if template:
            template.delete()

        return Response(
            {"message": response_data},
            status=status.HTTP_201_CREATED,
        )

    except:
        return HttpResponse("ERROR")


def index(request):
    return JsonResponse({"name": "OK"})


class PhoneNumberList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user_id = request.query_params.get("user_id")
        if user_id:
            phone_numbers = PhoneNumber.objects.filter(user__id=user_id)
            serializer = PhoneNumberSerializer(phone_numbers, many=True)
            numbers = [item["number"] for item in serializer.data]
        return Response(numbers, status=status.HTTP_200_OK)


# numbers upload from excel
class PhoneNumberUpload(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = ExcelSerializer(data=request.data)

        if serializer.is_valid():
            excel_file = serializer.validated_data["excel_file"]
            user_id = serializer.validated_data["user_id"]

            workbook = load_workbook(excel_file, read_only=True)
            worksheet = workbook.active

            for row in worksheet.iter_rows(values_only=True):
                raw_number = str(row[0])
                raw_number = raw_number.replace(" ", "")
                # print(raw_number)
                # replace 0 and add +91
                if raw_number.startswith("0"):
                    raw_number = "+91" + raw_number[1:]
                    # #print(raw_number)
                # if no +91 add +91
                if not raw_number.startswith("+91"):
                    raw_number = "+91" + raw_number
                # model save
                PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

            return Response(
                {"message": "Phone numbers imported successfully"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @shared_task
# def send_message_to_facebook(
#     excel, template_name, user_id, phone_number_id, bearer_token
# ):
#     try:
#         logger.info("Excel Data: %s", excel)
#         results = []
#         # excel_data = pd.read_json(excel_data_json)
#         for value in excel:
#             raw_number = str(value).replace(" ", "")
#             if (
#                 raw_number
#                 and (raw_number.startswith("91"))
#                 and (len(raw_number) == 12)
#             ):
#                 raw_number = "+" + raw_number
#             elif raw_number and raw_number.startswith("0"):
#                 raw_number = "+91" + raw_number[1:]
#             print(raw_number)

#             if raw_number:
#                 PhoneNumber.objects.get_or_create(
#                     number=raw_number, user_id=user_id
#                 )

#                 data = {
#                     "messaging_product": "whatsapp",
#                     "recipient_type": "individual",
#                     "to": raw_number,
#                     "type": "template",
#                     "template": {"name": template_name, "language": {"code": "en"}},
#                 }

#                 url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
#                 headers = {
#                     "Authorization": "Bearer " + bearer_token,
#                     "Content-Type": "application/json",
#                 }

#                 try:
#                     response = requests.post(url, headers=headers, json=data)
#                     response_data = response.json()
#                     results.append(response_data)
#                 except json.JSONDecodeError:
#                     pass
#         return "None"

#         # return results
#     except Exception as e:
#         # logger.exception("An error occurred in send_message_to_facebook task: %s", e)
#         # print("dscjbjhb")

#         raise e


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def excel_sent_message(request):
    try:
        print("dscjbjhb")

        serializer = ExcelSerializer(data=request.data)
        print("error")
        if serializer.is_valid():
            excel_data = serializer.validated_data["excel_file"]
            template_name = serializer.validated_data["template_name"]
            user_id = serializer.validated_data["user_id"]
            get_credential = get_credentials(user_id)
            phone_number_id = get_credential[0]["phone_number_id"]
            bearer_token = get_credential[0]["permanent_access_token"]
            excel = read_file(excel_data)

            try:
                send_message_to_facebook_excel_normal.delay(
                    excel, template_name, user_id, phone_number_id, bearer_token
                )
            except Exception as e:
                return HttpResponse(str(e), status=500)

            return Response(
                {"message": "Phone numbers import task queued successfully"},
                status=status.HTTP_202_ACCEPTED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def excel_personalised_sent_message(request):
    try:
        serializer = ExcelSerializer(data=request.data)
        if serializer.is_valid():
            excel_file = serializer.validated_data["excel_file"]
            template_name = serializer.validated_data["template_name"]
            user_id = serializer.validated_data["user_id"]
            get_credential = get_credentials(user_id)
            phone_number_id = get_credential[0]["phone_number_id"]
            bearer_token = get_credential[0]["permanent_access_token"]

            # Save the excel file to a temporary location
            temp_file_path = os.path.join(settings.MEDIA_ROOT, "temp", excel_file.name)
            os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
            with open(temp_file_path, "wb+") as destination:
                for chunk in excel_file.chunks():
                    destination.write(chunk)

            # Call the Celery task
            send_personalized_messages.delay(
                temp_file_path, template_name, phone_number_id, bearer_token, user_id
            )

            return Response(
                {"message": "Messages are being sent"}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def excel_sent_message_images(request):
    template_format = request.GET.get("template_format")

    try:
        serializer = ExcelImageSerializer(data=request.data)

        if serializer.is_valid():
            excel_file = serializer.validated_data["excel_file"]
            template_name = serializer.validated_data["template_name"]
            user_id = serializer.validated_data["user_id"]
            image_link = serializer.validated_data["image_link"]
            get_credential = get_credentials(user_id)
            phone_number_id = get_credential[0]["phone_number_id"]
            # business_id = get_credential[0]["whatsapp_business_id"]
            bearer_token = get_credential[0]["permanent_access_token"]
            excel = read_file(excel_file)

            # workbook = load_workbook(excel_file, read_only=True)
            # worksheet = workbook.active
            # results = []
            # template_instance = get_object_or_404(Template, template_name=template_name)
            # image_link_get = f"{domain_url}{template_instance.template_image.url}"
            # image_link_get = "https://www.clickdimensions.com/links/TestPDFfile.pdf"

            # send_message_to_facebook_excel_images(excel)

            try:
                # print("Cdsdc")
                send_message_to_facebook_excel_images.delay(
                    excel,
                    template_name,
                    user_id,
                    phone_number_id,
                    bearer_token,
                    image_link,
                    template_format,
                )
            except Exception as e:
                return HttpResponse(str(e), status=500)

            # for row in worksheet.iter_rows(values_only=True):
            #     raw_number = str(row[0])
            #     raw_number = raw_number.replace(" ", "")
            #     if raw_number.startswith("0"):
            #         raw_number = "+91" + raw_number[1:]
            #     if not raw_number.startswith("+91"):
            #         raw_number = "+91" + raw_number

            #     PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

            #     data = {
            #         "messaging_product": "whatsapp",
            #         "recipient_type": "individual",
            #         "to": raw_number,
            #         "type": "template",
            #         "template": {
            #             "name": template_name,
            #             "components": [
            #                 {
            #                     "type": "header",
            #                     "parameters": [
            #                         {
            #                             "type": "image",
            #                             "image": {"link": image_link_get},
            #                         }
            #                     ],
            #                 }
            #             ],
            #             "language": {"code": "en"},
            #         },
            #     }
            #     # #print(data)

            #     url = (
            #         "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages"
            #     )
            #     headers = {
            #         "Authorization": "Bearer " + bearer_token,
            #         "Content-Type": "application/json",
            #     }

            #     try:
            #         response = requests.post(url, headers=headers, json=data)
            #         response_data = response.json()
            #         results.append(response_data)

            #     except json.JSONDecodeError:
            #         return JsonResponse({"error": "Invalid JSON data"}, status=400)
            return Response(
                {"message": "Phone numbers import task queued successfully"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def excel_sent_message_images_personalised(request):
    try:
        serializer = ExcelImageSerializer(data=request.data)

        if serializer.is_valid():
            excel_file = serializer.validated_data["excel_file"]
            template_name = serializer.validated_data["template_name"]
            user_id = serializer.validated_data["user_id"]
            image_link = serializer.validated_data["image_link"]
            get_credential = get_credentials(user_id)
            phone_number_id = get_credential[0]["phone_number_id"]
            # business_id = get_credential[0]["whatsapp_business_id"]
            bearer_token = get_credential[0]["permanent_access_token"]

            workbook = load_workbook(excel_file, read_only=True)
            worksheet = workbook.active
            results = []
            template_instance = get_object_or_404(Template, template_name=template_name)
            image_link_get = f"{domain_url}{template_instance.template_image.url}"
            for row in worksheet.iter_rows(values_only=True):
                raw_number = str(row[1])
                name = str(row[0])
                # print(name)
                # replace 0 and add +91
                if raw_number.startswith("0"):
                    raw_number = "+91" + raw_number[1:]
                # if no +91 add +91
                if not raw_number.startswith("+91"):
                    raw_number = "+91" + raw_number

                # print(raw_number)
                # model save
                # PhoneNumber.objects.get_or_create(number=raw_number)
                PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

                data = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": raw_number,
                    "type": "template",
                    "template": {
                        "name": template_name,
                        "components": [
                            {
                                "type": "HEADER",
                                # "format": "IMAGE",
                                "parameters": [
                                    {
                                        "type": "image",
                                        "image": {
                                            "link": image_link_get
                                            # "link": "https://i.ibb.co/GTmcbDg/386384270-632166208949549-651046045893776904-n.png"
                                        },
                                    }
                                ],
                            },
                            {
                                "type": "body",
                                "parameters": [{"type": "text", "text": name}],
                            },
                        ],
                        "language": {"code": "en"},
                    },
                }
                # #print(data)

                url = (
                    "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages"
                )
                headers = {
                    "Authorization": "Bearer " + bearer_token,
                    "Content-Type": "application/json",
                }

                try:
                    response = requests.post(url, headers=headers, json=data)
                    response_data = response.json()
                    results.append(response_data)

                except json.JSONDecodeError:
                    return JsonResponse({"error": "Invalid JSON data"}, status=400)
            return Response(
                {"message": results},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def excel_upload_message(request):
    try:
        serializer = ExcelSerializer(data=request.data)

        if serializer.is_valid():
            # print("raw_number")

            excel_file = serializer.validated_data["excel_file"]
            user_id = serializer.validated_data["user_id"]

            workbook = load_workbook(excel_file, read_only=True)
            worksheet = workbook.active
            results = []

            for row in worksheet.iter_rows(values_only=True):
                raw_number = str(row[0])
                raw_number = raw_number.replace(" ", "")
                # print(raw_number)
                # print("raw_number")
                # replace 0 and add +91
                if raw_number.startswith("0"):
                    raw_number = "+91" + raw_number[1:]
                # if no +91 add +91
                if not raw_number.startswith("+91"):
                    raw_number = "+91" + raw_number
                # model save
                # PhoneNumber.objects.get_or_create(number=raw_number)
                # #print(raw_number)
                PhoneNumber.objects.get_or_create(number=raw_number, user_id=user_id)

            return Response(
                {"message": "Phone numbers imported successfully"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_whatsapp_bulk_messages(request):
    try:
        serializer = WhatsAppBulkMessageSerializer(data=request.data)

        if serializer.is_valid():
            template_name = serializer.validated_data.get("template_name")
            numbers = serializer.validated_data.get("numbers")
            user_id = serializer.validated_data.get("user_id")
            get_credential = get_credentials(user_id)
            # print(get_credential)
            phone_number_id = get_credential[0]["phone_number_id"]
            # business_id = get_credential[0]["whatsapp_business_id"]
            bearer_token = get_credential[0]["permanent_access_token"]
            results = []

        for number in numbers:
            # if number.startswith("0"):
            #     number = "+91" + number[1:]

            # if not number.startswith("+91"):
            #     number = "+91" + number

            # if not number:
            #     results.append({"error": "Missing 'number' parameter"})
            #     continue
            print(number)
            PhoneNumber.objects.get_or_create(number=number, user_id=user_id)

            data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": number,
                "type": "template",
                "template": {"name": template_name, "language": {"code": "en"}},
            }
            url = "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages"
            headers = {
                "Authorization": "Bearer " + bearer_token,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()
                results.append(response_data)
            except requests.exceptions.RequestException as e:
                results.append({"error": str(e)})
            except json.JSONDecodeError:
                results.append({"error": "Invalid JSON data"})

        for i, result in enumerate(results):
            if not isinstance(result, dict):
                results[i] = {"error": str(result)}

        return JsonResponse(results, status=200, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_whatsapp_bulk_messages_images(request):
    template_format = request.GET.get("template_format")
    try:
        serializer = WhatsAppBulkMessageImageSerializer(data=request.data)
        if serializer.is_valid():
            template_name = serializer.validated_data.get("template_name")
            numbers = serializer.validated_data.get("numbers")
            image_link = serializer.validated_data.get("image_link")
            user_id = serializer.validated_data.get("user_id")
            get_credential = get_credentials(user_id)
            phone_number_id = get_credential[0]["phone_number_id"]
            bearer_token = get_credential[0]["permanent_access_token"]
            try:
                # Send message to Celery task
                task = send_message_to_facebook_array.delay(
                    numbers,
                    template_name,
                    user_id,
                    phone_number_id,
                    bearer_token,
                    image_link,
                    template_format,
                )
                # Return the task ID, which is serializable
                return JsonResponse({"task_id": task.id}, status=202)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)

        else:
            return JsonResponse(serializer.errors, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


from celery.result import AsyncResult
from django.http import JsonResponse

@api_view(["GET"])
@permission_classes([IsAuthenticated])  # Apply this if you want to restrict access
def get_task_status(request, task_id):
    try:
        task = AsyncResult(task_id)
        response = {
            "task_id": task_id,
            "task_status": task.status,
            "task_result": task.result if task.successful() else None,
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# send bulk messages from addded names from database
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_whatsapp_model_bulk_messages(request):
    
    try:
        template_name = request.GET.get("template_name")
        user_id = request.GET.get("user_id")
        get_credential = get_credentials(user_id)
        phone_number_id = get_credential[0]["phone_number_id"]
        # business_id = get_credential[0]["whatsapp_business_id"]
        bearer_token = get_credential[0]["permanent_access_token"]
        user_instance = CustomUser.objects.get(pk=user_id)
        get_numbers = PhoneNumber.objects.filter(user_id=user_id).values_list(
            "number", flat=True
        )
        numbers = list(get_numbers)

        if not numbers or not isinstance(numbers, list):
            return JsonResponse(
                {"error": "Missing or invalid 'numbers' parameter"}, status=400
            )
        results = []

        for number in numbers:
            if not number:
                results.append({"error": "Missing 'number' parameter"})
                continue

            data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": number,
                "type": "template",
                "template": {"name": template_name, "language": {"code": "en"}},
            }

            url = "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages"
            headers = {
                "Authorization": "Bearer " + bearer_token,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()
                results.append(response_data)
            except requests.exceptions.RequestException as e:
                results.append({"error": str(e)})
            except json.JSONDecodeError:
                results.append({"error": "Invalid JSON data"})

        for i, result in enumerate(results):
            if not isinstance(result, dict):
                results[i] = {"error": str(result)}

        return JsonResponse(results, status=200, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# send bulk messages from addded names from database
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_whatsapp_model_bulk_messages_images(request):
    try:
        template_name = request.GET.get("template_name")
        user_id = request.GET.get("user_id")
        get_credential = get_credentials(user_id)
        phone_number_id = get_credential[0]["phone_number_id"]
        # business_id = get_credential[0]["whatsapp_business_id"]
        bearer_token = get_credential[0]["permanent_access_token"]
        image_url = request.GET.get("image_url")
        get_numbers = PhoneNumber.objects.filter(user_id=user_id).values_list(
            "number", flat=True
        )
        numbers = list(get_numbers)
        template_instance = get_object_or_404(Template, template_name=template_name)
        image_link_get = f"{domain_url}{template_instance.template_image.url}"

        # #print(f"{domain_url}{template_instance.template_image.url}")

        if not numbers or not isinstance(numbers, list):
            return JsonResponse(
                {"error": "Missing or invalid 'numbers' parameter"}, status=400
            )
        results = []

        for number in numbers:
            if not number:
                results.append({"error": "Missing 'number' parameter"})
                continue

            data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "components": [
                        {
                            "type": "HEADER",
                            # "format": "IMAGE",
                            "parameters": [
                                {
                                    "type": "image",
                                    "image": {"link": image_link_get},
                                }
                            ],
                        }
                    ],
                    "language": {"code": "en"},
                },
            }
            # #print(data)

            url = "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages"
            headers = {
                "Authorization": "Bearer " + bearer_token,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()
                results.append(response_data)
            except requests.exceptions.RequestException as e:
                results.append({"error": str(e)})
            except json.JSONDecodeError:
                results.append({"error": "Invalid JSON data"})

        for i, result in enumerate(results):
            if not isinstance(result, dict):
                results[i] = {"error": str(result)}

        return JsonResponse(results, status=200, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# # get templates
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_templates_message(request):
#     user_id = request.GET.get("user_id")
#     get_credential = get_credentials(user_id)
#     # phone_number_id = get_credential[0]["phone_number_id"]
#     business_id = get_credential[0]["whatsapp_business_id"]
#     bearer_token = get_credential[0]["permanent_access_token"]
#     template_instances = Template.objects.filter(user__id=user_id)

#     template_image_array = []

#     for template_instance in template_instances:
#         template_dict = {
#             template_instance.template_name: template_instance.template_image.url
#         }
#         template_image_array.append(template_dict)

#     # print(template_image_array)

#     url = "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
#     headers = {
#         "Authorization": "Bearer " + bearer_token,
#     }
#     # print(user_id)

#     try:
#         response = requests.get(url, headers=headers)
#         data = response.json()
#         templates = data.get("data", [])

#         names = [template.get("name", "") for template in templates]
#         components = [template.get("components", []) for template in templates]

#         name_response = {
#             "names": names,
#             "components": components,
#             "images": template_image_array,
#         }

#         # #print(data)
#         return JsonResponse({"data": name_response})
#         # return JsonResponse({"data": templates})
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_templates_message(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    if get_credential is not None and len(get_credential) > 0:
        business_id = get_credential[0]["whatsapp_business_id"]
    else:
        pass

    # business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    template_instances = Template.objects.filter(user__id=user_id)

    template_image_array = []

    for template_instance in template_instances:
        template_dict = {
            template_instance.template_name: template_instance.template_image.url
        }
        template_image_array.append(template_dict)

    url = f"https://graph.facebook.com/v18.0/{business_id}/message_templates"
    headers = {
        "Authorization": "Bearer " + bearer_token,
    }

    # Define a function to fetch template data
    def fetch_template_data():
        nonlocal templates
        try:
            response = requests.get(url, headers=headers)
            data = response.json()
            templates = data.get("data", [])
        except Exception as e:
            templates = {"error": str(e)}

    templates = []
    # Create and start the thread for fetching template data
    fetch_thread = threading.Thread(target=fetch_template_data)
    fetch_thread.start()

    # Wait for the fetch thread to complete
    fetch_thread.join()

    # Process the templates data
    if isinstance(templates, dict) and "error" in templates:
        return JsonResponse({"error": templates["error"]}, status=500)

    names = [template.get("name", "") for template in templates]
    components = [template.get("components", []) for template in templates]

    name_response = {
        "names": names,
        "components": components,
        "images": template_image_array,
    }

    return JsonResponse({"data": name_response})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_templates_list(request):
    user_id = request.GET.get("user_id")
    next_page = request.GET.get("next")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    if next_page:
        url = (
            "https://graph.facebook.com/v18.0/"
            + business_id
            + f"/message_templates?after={next_page}"
        )
    else:
        url = "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    headers = {
        "Authorization": "Bearer " + bearer_token,
    }

    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        templates = data.get("data", [])
        paging = data.get("paging")
        # print(paging)

        return JsonResponse({"data": templates, "paging": paging})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


import time


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_templates_analytics(request):
    user_id = request.GET.get("user_id")
    template_id = request.GET.get("template_id")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    # Validate start_date and end_date
    if not start_date or not end_date:
        return JsonResponse(
            {"error": "start_date and end_date are required"}, status=400
        )

    try:
        # Convert start_date and end_date to Unix timestamps
        start_timestamp = int(
            time.mktime(datetime.strptime(start_date, "%Y-%m-%d").timetuple())
        )
        end_timestamp = int(
            time.mktime(datetime.strptime(end_date, "%Y-%m-%d").timetuple())
        )
        print(start_timestamp)
        print(end_timestamp)
    except ValueError:
        return JsonResponse(
            {"error": "Invalid date format. Use YYYY-MM-DD."}, status=400
        )

    get_credential = get_credentials(user_id)
    # if not get_credential:
    #     return JsonResponse({"error": "Invalid user credentials"}, status=400)

    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    url = (
        f"https://graph.facebook.com/v20.0/{business_id}/template_analytics"
        f"?start={start_timestamp}&end={end_timestamp}"
        f"&granularity=DAILY&metric_types=['SENT','DELIVERED','READ','CLICKED']"
        f"&template_ids=[{template_id}]"
    )
    headers = {
        "Authorization": f"Bearer {bearer_token}",
    }

    # try:
    #     response = requests.get(url, headers=headers)
    #     data = response.json()

    #     if "error" in data:
    #         return JsonResponse(
    #             {"error": data["error"]["message"]}, status=response.status_code
    #         )

    #     return JsonResponse({"data": data.get("data", [])})
    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        if "error" in data:
            return JsonResponse(
                {"error": data["error"]["message"]}, status=response.status_code
            )

        total_sent = 0
        total_delivered = 0
        total_read = 0

        for item in data.get("data", []):
            for data_point in item.get("data_points", []):
                total_sent += data_point.get("sent", 0)
                total_delivered += data_point.get("delivered", 0)
                total_read += data_point.get("read", 0)

        summary = {
            "total_sent": total_sent,
            "total_delivered": total_delivered,
            "total_read": total_read,
        }

        return JsonResponse(summary)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTextTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    # {
                    #     "type": "HEADER",
                    #     "format": "TEXT",
                    #     "text": "Our {{1}} is on!",
                    #     "example": {"header_text": ["Sample Text"]},
                    # },
                    {
                        "type": "HEADER",
                        "format": "TEXT",
                        "text": header_text,
                    },
                    {"type": "BODY", "text": body_text},
                    {"type": "FOOTER", "text": footer_text},
                ],
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# def create_post_data(template_name, header_text, body_text, footer_text, document_type):
#     if document_type == "image":
#         format_type = "IMAGE"
#     elif document_type == "document":
#         format_type = "DOCUMENT"
#     elif document_type == "video":
#         format_type = "VIDEO"
#     else:
#         format_type = "TEXT"

#     post_data = {
#         "name": template_name,
#         "category": "MARKETING",
#         "language": "en",
#         "components": [
#             {
#                 "type": "HEADER",
#                 "format": format_type,
#                 "example": {"header_handle": header_text},
#             },
#             {"type": "BODY", "text": body_text},
#             {"type": "FOOTER", "text": footer_text},
#         ],
#     }

#     return json.dumps(post_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_image_template(request):
    user_id = request.GET.get("user_id")
    document_type = request.GET.get("type")
    get_credential = get_credentials(user_id)
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    {
                        "type": "HEADER",
                        "format": document_type,
                        "example": {"header_handle": header_text},
                    },
                    {"type": "BODY", "text": body_text},
                    {"type": "FOOTER", "text": footer_text},
                ],
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }
        print(344)
        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        print(response)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_image_template_url(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    document_type = request.GET.get("type")

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_text = data.get("button_text")
        button_url = data.get("button_url")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    {
                        "type": "HEADER",
                        "format": document_type,
                        "example": {"header_handle": header_text},
                    },
                    {"type": "BODY", "text": body_text},
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "URL",
                                "text": button_text,
                                "url": button_url,
                            }
                        ],
                    },
                ],
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_image_template_call(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    document_type = request.GET.get("type")
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_text = data.get("button_text")
        button_url = data.get("button_url")
        # print(template_name)

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    {
                        "type": "HEADER",
                        "format": document_type,
                        "example": {"header_handle": header_text},
                    },
                    {"type": "BODY", "text": body_text},
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "PHONE_NUMBER",
                                "text": button_text,
                                "phone_number": button_url,
                            }
                        ],
                    },
                ],
            }
        )
        # print(post_data)

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_image_template_personalised(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        # print(body_text)
        # print(header_text)

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    {
                        "type": "HEADER",
                        "format": "IMAGE",
                        "example": {"header_handle": header_text},
                    },
                    {
                        "type": "BODY",
                        # "text": "Thank you for your order, {{1}}! Your confirmation number is {{2}}. If you have any questions, please use the buttons below to contact support. Thank you for being a customer!",
                        # "example": {"body_text": [["Pablo", "860198-230332"]]}
                        "text": body_text,
                        "example": {"body_text": ["Sample"]},
                    },
                    {"type": "FOOTER", "text": footer_text},
                ],
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        print(response_data)

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template_button_site(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_type = data.get("button_type")
        button_text = data.get("button_text")
        button_url = data.get("button_url")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "components": [
                    {
                        "type": "HEADER",
                        "format": "TEXT",
                        "text": header_text,
                    },
                    {
                        "type": "BODY",
                        "text": body_text,
                    },
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "URL",
                                "text": button_text,
                                "url": button_url,
                            }
                        ],
                    },
                ],
                "language": "en",
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template_button_call(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_type = data.get("button_type")
        button_text = data.get("button_text")
        button_url = data.get("button_url")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "components": [
                    {"type": "HEADER", "format": "TEXT", "text": header_text},
                    {
                        "type": "BODY",
                        "text": body_text,
                    },
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "PHONE_NUMBER",
                                "text": button_text,
                                "phone_number": button_url,
                            }
                        ],
                    },
                ],
                "language": "en",
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template_personalised(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]
    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTextTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "language": "en",
                "components": [
                    {
                        "type": "HEADER",
                        "format": "TEXT",
                        "text": header_text,
                        "example": {"header_text": ["Sample Text"]},
                    },
                    # {"type": "HEADER", "format": "TEXT", "text": header_text},
                    {"type": "BODY", "text": body_text},
                    {"type": "FOOTER", "text": footer_text},
                ],
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template_button_site_personalised(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_type = data.get("button_type")
        button_text = data.get("button_text")
        button_url = data.get("button_url")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "components": [
                    {
                        "type": "HEADER",
                        "format": "TEXT",
                        "text": header_text,
                        "example": {"header_text": ["Sample Text"]},
                    },
                    {
                        "type": "BODY",
                        "text": body_text,
                    },
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "URL",
                                "text": button_text,
                                "url": button_url,
                            }
                        ],
                    },
                ],
                "language": "en",
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_text_template_button_call_personalised(request):
    user_id = request.GET.get("user_id")
    get_credential = get_credentials(user_id)
    # phone_number_id = get_credential[0]["phone_number_id"]
    business_id = get_credential[0]["whatsapp_business_id"]
    bearer_token = get_credential[0]["permanent_access_token"]

    facebook_api_url = (
        "https://graph.facebook.com/v18.0/" + business_id + "/message_templates"
    )
    serializer = MessageTemplateSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data
        template_name = data.get("template_name")
        header_text = data.get("header_text")
        body_text = data.get("body_text")
        footer_text = data.get("footer_text")
        button_type = data.get("button_type")
        button_text = data.get("button_text")
        button_url = data.get("button_url")

        post_data = json.dumps(
            {
                "name": template_name,
                "category": "MARKETING",
                "components": [
                    {
                        "type": "HEADER",
                        "format": "TEXT",
                        "text": header_text,
                        "example": {"header_text": ["Sample Text"]},
                    },
                    {
                        "type": "BODY",
                        "text": body_text,
                    },
                    {"type": "FOOTER", "text": footer_text},
                    {
                        "type": "BUTTONS",
                        "buttons": [
                            {
                                "type": "PHONE_NUMBER",
                                "text": button_text,
                                "phone_number": button_url,
                            }
                        ],
                    },
                ],
                "language": "en",
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + bearer_token,
        }

        response = requests.post(facebook_api_url, data=post_data, headers=headers)
        response_data = response.json()

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": response_data},
                status=response.status_code,
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# privacy policy
def privacy(request):
    return JsonResponse(
        {
            "privacy & Policy": "Message FlowsWhen a user sends a message to one of these businesses, the message travels end-to-end encrypted between the user and the Cloud API. As per the Signal protocol, the user and the Cloud API, on behalf of the business, negotiate encryption keys and establish a secure communication channel. WhatsApp cannot access any message content exchanged between users and businesses.Once a message is received by the Cloud API, it gets decrypted and forwarded to the Business. Messages are only temporarily stored by the Cloud API as required to provide the base API functionality.Messages from a business to a user flow on the reverse path. Businesses send messages to Cloud API. The Cloud API service stores the messages temporarily and takes on the task to send the message to the WhatsApp platform. Messages are stored for any necessary retransmissions.All messages are encrypted by the Cloud API before being sent to WhatsApp using the Signal protocol with keys negotiated with the user (recipient).WhatsApp acts as the transport service. It provides the message forwarding software; both client and server. It has no visibility into the messages being sent. It protects the users by detecting unusual messaging patterns (like a business trying to message all users) or collecting spam reports from users.Cloud API, operated by Meta, acts as the intermediary between WhatsApp and the Cloud API businesses. In other words, those businesses have given Cloud API the power to operate on their behalf. Because of this, WhatsApp forwards all message traffic destined for those businesses to Cloud API. WhatsApp also expects to receive from Cloud API all message traffic from those businesses. This is the same client behavior that the On-Premise client has.WhatsApp gives Cloud API metering and billing information for the Cloud API businesses. It does not share any other messaging information.Meta, in providing the WhatsApp Cloud API service, acts as a Data Processor on behalf of the business. In other words, the businesses have requested Meta to provide programmatic access to the WhatsApp platform.Cloud API receives from WhatsApp the messages destined for the businesses that use Cloud API. Cloud API also sends to WhatsApp the messages sent by those businesses. Other parts of Meta (other than Cloud API) do not have access to the Cloud API business communications, including message content and metadata. Meta does not use any Cloud API data for advertising.Stored and Collected DataAll data collected, stored and accessed by Cloud API is controlled and monitored to ensure proper usage and maintain the high level of privacy expected from a WhatsApp client.Information about the businesses, including their phone numbers, business address, contacts, type, etc. is maintained by Meta and the Business Manager product and is subject to the terms of service set by Meta. Cloud API relies on Business Manager and other Meta systems to identify any access to Cloud API on behalf of the business.Messages sent or received via Cloud API are only accessed by Cloud API, no other part of Meta can use this information. Messages have a maximum retention period of 30 days in order to provide the base features and functionality of the Cloud API service; for example, retransmissions. After 30 days, these features and functionality are no longer available.Cloud API does not rely on any information about the user (customer/consumer) the business is communicating with other than the phone number used to identify the account. This information is used to deliver the messages via the WhatsApp client code. User phone numbers are used as sources or destinations of individual messages; as such they are deleted when messages are deleted. No other part of Meta has access to this information. Like the On-Premise client, the WhatsApp client code used by Cloud API collects messaging information about the business as required by WhatsApp. This is information used by WhatsApp to detect malicious activity. No message content is shared or sent to WhatsApp at any time and no WhatsApp employee has access to any message content."
        }
    )


# webhook handle
@csrf_exempt
def whatsapp_webhook(request):
    if request.method == "GET":
        mode = request.GET.get("hub.mode")
        challenge = request.GET.get("hub.challenge")
        token = request.GET.get("hub.verify_token")

        if mode and token:
            if mode == "subscribe" and token == my_token:
                return HttpResponse(challenge, content_type="text/plain")
            else:
                return HttpResponse(status=403)

    return HttpResponse("OK", content_type="text/plain")


from datetime import datetime, timedelta, timezone

# from .tasks import make_api_call

import pytz


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime

# from .tasks import schedule_hello


class ScheduleHelloView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            datetime_param = request.data.get("datetime_param")
            # print(timezone.now())

            target_datetime = timezone.datetime.strptime(
                datetime_param, "%Y-%m-%dT%H:%M:%S.%fZ"
            )

            schedule_hello.apply_async((target_datetime,), eta=target_datetime)

            return Response(
                {"message": "Task scheduled successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
def schedule_api_call(request):
    # print("Request Data:", request.data)

    scheduled_time_str = request.data.get("scheduled_time")
    api_data = request.data.get("api_data")

    if scheduled_time_str is not None:
        try:
            time = datetime.now(timezone.utc)
            current_time_utc = datetime.utcnow().replace(tzinfo=pytz.UTC)

            ist = pytz.timezone("Asia/Kolkata")
            # print(time)
            current_time_ist = current_time_utc.astimezone(ist)
            current_time_ist_plus_one_minute = current_time_ist + timedelta(minutes=1)
            # print(current_time_ist)
            # print(current_time_ist_plus_one_minute)

            task = ScheduledAPICall.objects.create(
                api_data=api_data, scheduled_time=time
            )

            make_api_call.apply_async(
                args=[task.id], eta=current_time_ist_plus_one_minute
            )

            return HttpResponse("API call scheduled successfully!")
        except ValueError as e:
            return HttpResponse(f"Error: {e}", status=400)
    else:
        return HttpResponse("Error: Scheduled time is required", status=400)


class ContactFormView(APIView):
    def get(self, request):
        contact_forms = ContactForm.objects.all()
        serializer = ContactFormSerializer(contact_forms, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import httpx
from asgiref.sync import async_to_sync, sync_to_async


@api_view(["GET"])
@permission_classes([AllowAny])
def check_validation(request):
    # return async_to_sync(check_validation_async)(request)


# async def check_validation_async(request):
    user_id = request.GET.get("user_id")
    # get_credential_async = sync_to_async(get_credentials, thread_sensitive=True)
    get_credential = get_credentials(user_id)

    if get_credential is not None:
        phone_number_id = get_credential[0]["phone_number_id"]
        business_id = get_credential[0]["whatsapp_business_id"]
        bearer_token = get_credential[0]["permanent_access_token"]
        app_id = get_credential[0]["app_id"]

        facebook_api_url = (
            f"https://graph.facebook.com/v18.0/{business_id}/message_templates"
        )
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {bearer_token}",
        }

        # async with httpx.AsyncClient() as client:
        response =  requests.get(facebook_api_url, headers=headers)
        response_data = response.json()
            # print(response_data)

        if response.status_code == status.HTTP_200_OK:
            return Response(
                {"message": response_data, "access": "added"},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "message": {
                        "phone_number_id": phone_number_id,
                        "business_id": business_id,
                        "app_id": app_id,
                    },
                    "access": "added-not-valid",
                },
                status=response.status_code,
            )
    else:
        return Response({"access": "not-added"}, status=status.HTTP_400_BAD_REQUEST)


class CheckTokenValidityView(APIView):
    def get(self, request):
        token = request.GET.get("token")

        if not token:
            return Response(
                {"error": "Token not provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response(
                {"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED
            )


class CheckNotifications(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get(self, request):
        userid = request.GET.get("userid")
        if not userid:
            return Response(
                {"error": "Userid not provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        if userid:
            unread_notifications = Notification.objects.filter(
                user__id=userid, is_read=False
            )
            read_notification = Notification.objects.filter(
                user__id=userid, is_read=True
            )

            non_read_notificationsjson = [
                {"notification": data.message, "id": data.id}
                for data in unread_notifications
            ]
            read_notificationsjson = [
                {"notification": data.message, "id": data.id}
                for data in read_notification
            ]

            return JsonResponse(
                {"read": read_notificationsjson, "unread": non_read_notificationsjson},
                safe=False,
                status=status.HTTP_200_OK,
            )

        else:
            return JsonResponse(
                {"notification": "no notification"}, status=status.HTTP_401_UNAUTHORIZED
            )

    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response(
                {"error": "Message not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = CustomUser.objects.all()
        notifications = [
            Notification(user=user, message=message, created_at=timezone.now())
            for user in users
        ]

        Notification.objects.bulk_create(notifications)

        created_notifications = [
            {"notification": notification.message, "id": notification.id}
            for notification in notifications
        ]

        return JsonResponse(
            {"created_notifications": created_notifications},
            safe=False,
            status=status.HTTP_201_CREATED,
        )


class MarkNotificationAsRead(APIView):
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = not notification.is_read
        notification.save()

        return Response(
            {"success": "Notification marked as read"}, status=status.HTTP_200_OK
        )

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()

        return Response(
            {"success": "Notification deleted"}, status=status.HTTP_204_NO_CONTENT
        )


class PlanPurchaseDetail(APIView):
    def get_object(self, pk):
        try:
            return PlanPurchase.objects.get(pk=pk)
        except PlanPurchase.DoesNotExist:
            raise Http404

    def get(self, request, pk=None, format=None):
        if pk:
            plan_purchase = self.get_object(pk)
            serializer = PlanPurchaseSerializer(plan_purchase)
            return Response(serializer.data)
        else:
            plan_purchases = PlanPurchase.objects.all()
            serializer = PlanPurchaseSerializer(plan_purchases, many=True)
            return Response(serializer.data)

    def post(self, request, pk=None, format=None):
        serializer = PlanPurchaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from .models import Blog
from .serializers import BlogSerializer


class BlogListCreateAPIView(generics.ListCreateAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return []


@api_view(["GET"])
def bloglist_published(request):
    queryset = Blog.objects.filter(published=True)

    serializer = BlogSerializer(queryset, many=True)
    return Response(serializer.data)


class BlogRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return []


from django.shortcuts import render


def custom_404(request, exception):
    return render(request, "404.html", status=404)


from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser


class ContactGroupViewSet(generics.ListCreateAPIView):
    serializer_class = ContactGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # user_id = self.request.query_params.get('user_id')
        # if user_id:
        return ContactGroup.objects.filter(user=self.request.user)
        # return ContactGroup.objects.all()

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        if file:
            phone_numbers = read_file(file)
            if phone_numbers:
                validated_data = {
                    "name": request.data.get("name"),
                    "phone_numbers": phone_numbers,
                    "user": request.data.get("user"),
                }
                serializer = self.get_serializer(data=validated_data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    serializer.data, status=status.HTTP_201_CREATED, headers=headers
                )
            return Response(
                {"detail": "Invalid file format or empty file."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().post(request, *args, **kwargs)


class ContactGroupUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContactGroup.objects.all()
    serializer_class = ContactGroupSerializer
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        file = request.FILES.get("file")

        if file:
            phone_numbers = read_file(file)
            # request.data.update({"phone_numbers": phone_numbers})
            print("shdgchcjsgjh", str(instance.phone_numbers))
            phone_numbers_list = instance.phone_numbers.split(",")
            existing_numbers = set(phone_numbers_list)
            new_numbers = set(phone_numbers)
            print("ffffffffffffffffffff", existing_numbers)
            combined_numbers = list(existing_numbers.union(new_numbers))
            print(combined_numbers)
            instance.phone_numbers = ",".join(map(str, combined_numbers))
            instance.save()
            # instance.save()
            return Response({"success": "Edited"})

        else:
            return Response(
                {
                    "detail": "Invalid file format, empty file, or incorrect data structure."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["POST"])
def custom_message_view(request):
    serializer = CustomMessageSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.validated_data.get("message")
        numbers = serializer.validated_data.get("numbers")
        get_credential = get_credentials(request.user)
        phone_number_id = get_credential[0]["phone_number_id"]
        bearer_token = get_credential[0]["permanent_access_token"]
        send_message_to_facebook_custom.delay(
            message, numbers, phone_number_id, bearer_token
        )
        return Response(
            {"message": "Data received successfully"}, status=status.HTTP_200_OK
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
