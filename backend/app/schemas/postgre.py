from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ============================================================================
# Contact/Reachout Schemas
# ============================================================================

class ReachoutCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=500)
    message: str = Field(min_length=1, max_length=5000)


class ReachoutResponse(BaseModel):
    id: int
    message: str
    email_sent: bool


# ============================================================================
# Product Schemas
# ============================================================================

class ProductImage(BaseModel):
    id: int
    image_data_url: str
    image_order: int


class ProductCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    category: str = Field(min_length=1, max_length=80)
    artisan: str | None = Field(default=None, max_length=180)
    price: str = Field(min_length=1, max_length=60, pattern=r"^\d+(\.\d{1,2})?$")
    image_url: str | None = Field(default=None, max_length=1000)
    images_base64: list[dict] | None = Field(default=None)  # List of {"data": base64_string, "mime_type": "image/png"}
    description: str | None = Field(default=None, max_length=5000)


class ProductUpdateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    category: str = Field(min_length=1, max_length=80)
    artisan: str | None = Field(default=None, max_length=180)
    price: str = Field(min_length=1, max_length=60, pattern=r"^\d+(\.\d{1,2})?$")
    images_base64: list[dict] | None = Field(default=None)  # Optional replacement list of {"data", "mime_type"}
    description: str | None = Field(default=None, max_length=5000)


class ProductItem(BaseModel):
    id: int
    title: str
    category: str
    artisan: str | None
    price: str
    image_url: str | None
    image_data_urls: list[ProductImage]
    description: str | None
    created_at: datetime


class ProductListResponse(BaseModel):
    products: list[ProductItem]


# ============================================================================
# Admin Schemas
# ============================================================================

class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=1, max_length=255)


class AdminLoginResponse(BaseModel):
    message: str
    token: str


class AdminLeadItem(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    address: str | None
    message: str
    created_at: datetime


class AdminLeadsResponse(BaseModel):
    leads: list[AdminLeadItem]


class AdminProductsResponse(BaseModel):
    products: list[ProductItem]


class CategoryCount(BaseModel):
    category: str
    count: int


class DailyLeadCount(BaseModel):
    date: str
    count: int


class AdminAnalyticsResponse(BaseModel):
    total_products: int
    total_leads: int
    leads_last_7_days: int
    products_added_last_7_days: int
    categories: list[CategoryCount]
    daily_leads_last_14_days: list[DailyLeadCount]
