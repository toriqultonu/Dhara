"""Common models."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    providers: dict[str, str]


class ErrorResponse(BaseModel):
    detail: str
