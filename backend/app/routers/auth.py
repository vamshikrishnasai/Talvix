from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import timedelta
import jwt
import os
import base64
from dotenv import load_dotenv

from .. import models, schemas, utils, database
from ..utils import SECRET_KEY, ALGORITHM

load_dotenv(override=True)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("DEBUG: Token decode successful but 'sub' (email) is missing")
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except Exception as e:
        print(f"DEBUG: Token decode failed: {str(e)}")
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        print(f"DEBUG: Token valid for {token_data.email}, but user not found in database (likely due to DB wipe)")
        raise credentials_exception
    return user

@router.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(func.lower(models.User.email) == func.lower(user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = utils.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(func.lower(models.User.email) == func.lower(form_data.username)).first()
    if not user or not utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=schemas.User)
def patch_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    updatable_fields = [
        'full_name', 'target_role', 'prep_duration', 'user_type',
        'photo_url', 'linkedin_url', 'github_url', 'leetcode_url',
        'hackerrank_url', 'codechef_url', 'medium_url', 'stackoverflow_url'
    ]
    for field in updatable_fields:
        val = getattr(user_update, field, None)
        if val is not None:
            setattr(current_user, field, val)

    # Handle target_company separately (reset cache if changed)
    if user_update.target_company is not None:
        if current_user.target_company != user_update.target_company:
            current_user.target_company_info = None
        current_user.target_company = user_update.target_company

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Upload a profile photo. Stores as base64 data URL (no external storage needed)."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Limit to 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    # Encode as data URL
    b64 = base64.b64encode(contents).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{b64}"

    current_user.photo_url = data_url
    db.commit()
    db.refresh(current_user)
    return {"photo_url": data_url, "message": "Photo uploaded successfully"}
