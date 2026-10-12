import bcrypt
import os
import datetime
import jwt
from pandas.core import algorithms

def hash_password(password: str) -> str:
    """
    Plain password ko bcrypt hash mein convert karta hai.
    Passlib bug ko bypass karne ke liye direct bcrypt engine.
    """
    # Password ko bytes mein convert karke 72 bytes tak truncate karein
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Plain password ko database hash se check karta hai.
    """
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

SECRET_KEY = os.getenv("SECRET_KEY", "628ca802d5c00a1c026240155b4c65c369d81076ea513df2d7df54f0557cb509")
ALGORITHM = "HS256"


def create_access_token(user_id: int, hours: int = 24) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    """Valid token par user_id (int) deta hai, warna None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except Exception:
        return None