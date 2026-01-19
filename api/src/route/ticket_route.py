from fastapi import APIRouter
import src.core.ticket_core as ticket_core
from src.db_schema.database import db
from src.db_schema.ticket_schema import to_list_of_object_from_db
import logging

str_name = "ticket"
router = APIRouter(prefix="/api", tags=[str_name])
logger = logging.getLogger("monitoring_psre")

@router.get("/tickets")
async def get_tickets(status: str = "open"):
    """
    Get tickets based on status
    - status=open: Returns tickets with resolve=False
    - status=closed: Returns tickets with resolve=True
    """
    try:
        if status == "open":
            return ticket_core.get_all_active()
        elif status == "closed":
            collection = db["tickets"]
            result = to_list_of_object_from_db(
                collection.find({"resolve": True}).sort("end", -1)
            )
            return result
        else:
            return {"error": "Invalid status parameter. Use 'open' or 'closed'"}
    except Exception as e:
        logger.error(f"Error getting tickets: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/tickets/cleanup")
async def cleanup_tickets(days: int = 90):
    """
    Manually trigger cleanup of closed tickets older than X days
    """
    try:
        count = ticket_core.delete_old_closed_tickets(days)
        return {"status": "success", "deleted_count": count}
    except Exception as e:
        logger.error(f"Error during ticket cleanup: {e}")
        return {"status": "error", "message": str(e)}
