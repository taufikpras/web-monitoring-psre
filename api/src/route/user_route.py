from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from src.db_schema.database import db
from src.db_schema.user_schema import UserCreate, UserResponse, UserUpdate, UserRole
from src.util.auth_util import get_password_hash, verify_password, create_access_token, decode_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson import ObjectId

router = APIRouter(prefix="/api/users", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.users.find_one({"username": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.get("is_approved"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not approved")
    return user

def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

@router.get("/setup-check")
async def check_setup():
    count = db.users.count_documents({})
    return {"setup_required": count == 0}

@router.post("/setup-admin")
async def setup_admin(user: UserCreate):
    count = db.users.count_documents({})
    if count > 0:
        raise HTTPException(status_code=400, detail="Admin already setup")
    
    hashed_pw = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "hashed_password": hashed_pw,
        "role": UserRole.ADMIN,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "approved_at": datetime.utcnow()
    }
    result = db.users.insert_one(new_user)
    return {"message": "Admin created", "id": str(result.inserted_id)}

@router.post("/register")
async def register(user: UserCreate):
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pw = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "hashed_password": hashed_pw,
        "role": UserRole.USER,
        "is_approved": False,
        "created_at": datetime.utcnow()
    }
    result = db.users.insert_one(new_user)
    return {"message": "User registered, pending approval", "id": str(result.inserted_id)}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not user.get("is_approved"):
        raise HTTPException(status_code=403, detail="Account pending approval")
    
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}

@router.get("/", response_model=List[UserResponse])
async def list_users(admin: dict = Depends(admin_required)):
    users = list(db.users.find())
    for user in users:
        user["id"] = str(user.pop("_id"))
    return users

@router.put("/{user_id}/approve")
async def approve_user(user_id: str, admin: dict = Depends(admin_required)):
    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_approved": True, "approved_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved"}

@router.put("/{user_id}/role")
async def change_role(user_id: str, role_update: UserUpdate, admin: dict = Depends(admin_required)):
    if role_update.role not in [UserRole.ADMIN, UserRole.USER]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role_update.role}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Role updated"}

@router.delete("/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(admin_required)):
    if str(admin["_id"]) == user_id:
         raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
         
    result = db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
