from pydantic import BaseModel, field_validator
import re

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def strong_password(cls, v):
        errors = []

        if len(v) < 8:
            errors.append("at least 8 characters")
        if not re.search(r"[A-Z]", v):
            errors.append("one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("one lowercase letter")
        if not re.search(r"[0-9]", v):
            errors.append("one number")

        if errors:
            raise ValueError("Password must contain " + ", ".join(errors))

        return v


class UserLogin(BaseModel):
    username: str
    password: str
