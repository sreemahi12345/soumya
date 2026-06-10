from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, ProductImage
from app.schemas.postgre import ProductItem, ProductListResponse, ProductImage as ProductImageSchema

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def list_products(category: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Product)
    if category and category.upper() != "ALL":
        query = query.filter(Product.category == category.upper())
    products = query.order_by(Product.created_at.desc()).all()
    product_ids = [product.id for product in products]
    images = db.query(ProductImage).filter(ProductImage.product_id.in_(product_ids)).all() if product_ids else []
    images_by_product_id = {}
    for image in images:
        if image.product_id not in images_by_product_id:
            images_by_product_id[image.product_id] = []
        images_by_product_id[image.product_id].append(image)

    return ProductListResponse(
        products=[
            ProductItem(
                id=product.id,
                title=product.title,
                category=product.category,
                artisan=product.artisan,
                price=product.price,
                image_url=product.image_url,
                image_data_urls=[
                    ProductImageSchema(
                        id=img.id,
                        image_data_url=f"data:{img.image_mime_type};base64,{img.image_base64}",
                        image_order=img.image_order,
                    )
                    for img in sorted(images_by_product_id.get(product.id, []), key=lambda x: x.image_order)
                ],
                description=product.description,
                created_at=product.created_at,
            )
            for product in products
        ]
    )
