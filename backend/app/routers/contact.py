import logging

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ReachoutLead
from app.schemas.postgre import ReachoutCreate, ReachoutResponse
from app.services.email_service import send_reachout_email

router = APIRouter(prefix="/api/reachout", tags=["reachout"])
logger = logging.getLogger("uvicorn.error")


def _send_reachout_email_safely(payload: ReachoutCreate, submission_id: int) -> None:
    try:
        send_reachout_email(payload, submission_id=submission_id)
    except Exception:
        logger.exception("Reachout email delivery failed for submission id=%s", submission_id)


@router.post("", response_model=ReachoutResponse, status_code=status.HTTP_201_CREATED)
def create_reachout(
    payload: ReachoutCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    lead = ReachoutLead(
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        address=payload.address,
        message=payload.message,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    background_tasks.add_task(_send_reachout_email_safely, payload, lead.id)

    return ReachoutResponse(
        id=lead.id,
        message="Reachout details saved successfully",
        email_sent=True,
    )


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reachout(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(ReachoutLead).filter(ReachoutLead.id == lead_id).first()
    if not lead:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reachout submission not found")
    
    db.delete(lead)
    db.commit()
