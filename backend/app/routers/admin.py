import base64
import csv
import io
from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser, Product, ProductImage, ReachoutLead
from app.schemas.postgre import AdminAnalyticsResponse, AdminLeadItem, AdminLeadsResponse, AdminLoginRequest, AdminLoginResponse, AdminProductsResponse, CategoryCount, DailyLeadCount, ProductCreateRequest, ProductItem, ProductImage as ProductImageSchema, ProductUpdateRequest
from app.services.admin_auth import create_session_token, is_session_valid, verify_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _validate_admin_token(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not is_session_valid(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def _to_product_item(product: Product, product_images: list[ProductImage]) -> ProductItem:
    image_data_urls = [
        ProductImageSchema(
            id=img.id,
            image_data_url=f"data:{img.image_mime_type};base64,{img.image_base64}",
            image_order=img.image_order,
        )
        for img in sorted(product_images, key=lambda x: x.image_order)
    ]

    return ProductItem(
        id=product.id,
        title=product.title,
        category=product.category,
        artisan=product.artisan,
        price=product.price,
        image_url=product.image_url,
        image_data_urls=image_data_urls,
        description=product.description,
        created_at=product.created_at,
    )


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    token = create_session_token(settings.admin_session_minutes)
    return AdminLoginResponse(message="Admin login successful", token=token)


@router.get("/leads", response_model=AdminLeadsResponse)
def list_reachout_leads(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    leads = db.query(ReachoutLead).order_by(ReachoutLead.created_at.desc()).all()
    return AdminLeadsResponse(
        leads=[
            AdminLeadItem(
                id=lead.id,
                name=lead.name,
                email=lead.email,
                phone=lead.phone,
                address=lead.address,
                message=lead.message,
                created_at=lead.created_at,
            )
            for lead in leads
        ]
    )


@router.post("/products", response_model=ProductItem, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreateRequest, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    if payload.images_base64 and not isinstance(payload.images_base64, list):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="images_base64 must be a list")

    if payload.images_base64 and len(payload.images_base64) > 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Maximum 10 images allowed per product")

    # Validate all images
    if payload.images_base64:
        for idx, img in enumerate(payload.images_base64):
            if not img.get("data") or not img.get("mime_type"):
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image {idx + 1}: missing 'data' or 'mime_type'")
            try:
                base64.b64decode(img["data"], validate=True)
            except Exception as exc:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image {idx + 1}: Invalid base64 data") from exc

    product = Product(
        title=payload.title,
        category=payload.category.strip().upper(),
        artisan=payload.artisan,
        price=payload.price,
        image_url=payload.image_url,
        description=payload.description,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    product_images = []
    if payload.images_base64:
        for idx, img_data in enumerate(payload.images_base64):
            product_image = ProductImage(
                product_id=product.id,
                image_base64=img_data["data"],
                image_mime_type=img_data["mime_type"],
                image_order=idx,
            )
            db.add(product_image)
            product_images.append(product_image)
        db.commit()

    return _to_product_item(product, product_images)


@router.get("/products", response_model=AdminProductsResponse)
def list_admin_products(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    products = db.query(Product).order_by(Product.created_at.desc()).all()
    product_ids = [product.id for product in products]
    images = db.query(ProductImage).filter(ProductImage.product_id.in_(product_ids)).all() if product_ids else []
    images_by_product_id = {}
    for image in images:
        if image.product_id not in images_by_product_id:
            images_by_product_id[image.product_id] = []
        images_by_product_id[image.product_id].append(image)

    return AdminProductsResponse(
        products=[_to_product_item(product, images_by_product_id.get(product.id, [])) for product in products]
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
    db.delete(product)
    db.commit()


@router.put("/products/{product_id}", response_model=ProductItem)
def update_product(
    product_id: int,
    payload: ProductUpdateRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    _validate_admin_token(authorization)

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.title = payload.title.strip()
    product.category = payload.category.strip().upper()
    product.artisan = payload.artisan.strip() if payload.artisan else None
    product.price = payload.price.strip()
    product.description = payload.description.strip() if payload.description else None

    if payload.images_base64 is not None:
        if not isinstance(payload.images_base64, list):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="images_base64 must be a list")

        if len(payload.images_base64) > 10:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Maximum 10 images allowed per product")

        for idx, img in enumerate(payload.images_base64):
            if not img.get("data") or not img.get("mime_type"):
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image {idx + 1}: missing 'data' or 'mime_type'")
            try:
                base64.b64decode(img["data"], validate=True)
            except Exception as exc:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image {idx + 1}: Invalid base64 data") from exc

        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, img_data in enumerate(payload.images_base64):
            db.add(
                ProductImage(
                    product_id=product.id,
                    image_base64=img_data["data"],
                    image_mime_type=img_data["mime_type"],
                    image_order=idx,
                )
            )

    db.commit()
    db.refresh(product)

    product_images = db.query(ProductImage).filter(ProductImage.product_id == product.id).all()
    return _to_product_item(product, product_images)


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    now_utc = datetime.now(timezone.utc)
    seven_days_ago = now_utc - timedelta(days=7)
    fourteen_days_ago_date = (now_utc - timedelta(days=13)).date()

    products = db.query(Product).all()
    leads = db.query(ReachoutLead).all()

    categories_counter = Counter((product.category or "UNCATEGORIZED") for product in products)
    categories = [
        CategoryCount(category=category, count=count)
        for category, count in sorted(categories_counter.items(), key=lambda item: item[1], reverse=True)
    ]

    daily_bucket = {str(fourteen_days_ago_date + timedelta(days=i)): 0 for i in range(14)}
    for lead in leads:
        lead_date = lead.created_at.date()
        lead_date_str = str(lead_date)
        if lead_date_str in daily_bucket:
            daily_bucket[lead_date_str] += 1

    daily_leads = [
        DailyLeadCount(date=date_key, count=count)
        for date_key, count in sorted(daily_bucket.items(), key=lambda item: item[0])
    ]

    leads_last_7_days = sum(1 for lead in leads if lead.created_at >= seven_days_ago)
    products_last_7_days = sum(1 for product in products if product.created_at >= seven_days_ago)

    return AdminAnalyticsResponse(
        total_products=len(products),
        total_leads=len(leads),
        leads_last_7_days=leads_last_7_days,
        products_added_last_7_days=products_last_7_days,
        categories=categories,
        daily_leads_last_14_days=daily_leads,
    )


@router.get("/leads/export.csv")
def export_leads_csv(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    leads = db.query(ReachoutLead).order_by(ReachoutLead.created_at.desc()).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "name", "email", "phone", "address", "message", "created_at"])
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.email,
            lead.phone or "",
            lead.address or "",
            lead.message,
            lead.created_at.isoformat(),
        ])
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reachout_leads.csv"},
    )


@router.get("/products/export.csv")
def export_products_csv(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    _validate_admin_token(authorization)

    products = db.query(Product).order_by(Product.created_at.desc()).all()
    images_by_product = {}
    product_ids = [product.id for product in products]
    if product_ids:
        images = db.query(ProductImage).filter(ProductImage.product_id.in_(product_ids)).all()
        for image in images:
            images_by_product.setdefault(image.product_id, 0)
            images_by_product[image.product_id] += 1

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "title", "category", "artisan", "price", "image_count", "created_at"])
    for product in products:
        writer.writerow([
            product.id,
            product.title,
            product.category,
            product.artisan or "",
            product.price,
            images_by_product.get(product.id, 0),
            product.created_at.isoformat(),
        ])
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )
