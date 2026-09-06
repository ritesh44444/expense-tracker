from datetime import date, datetime

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    description: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: date
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True