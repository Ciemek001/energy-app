from pydantic import BaseModel


class MaterialBase(BaseModel):
    name: str
    u_value: float


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: str | None = None
    u_value: float | None = None


class MaterialOut(MaterialBase):
    id: int

    class Config:
        from_attributes = True
