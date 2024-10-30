# utils.py
from cryptography.fernet import Fernet
from django.conf import settings

cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_data(data):
    if data:
        return cipher_suite.encrypt(data.encode()).decode()
    return None

def decrypt_data(encrypted_data):
    if encrypted_data:
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    return None
