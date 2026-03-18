from fastapi import APIRouter, Depends, HTTPException
from ..services.market_service import market_service
from . import auth
from .. import models

router = APIRouter()

@router.get("/insights")
async def get_insights(
    role: str = "All",
    location: str = "All",
    current_user: models.User = Depends(auth.get_current_user)
):
    insights = market_service.get_market_insights(role, location)
    if "error" in insights:
        raise HTTPException(status_code=404, detail=insights["error"])
    return insights

@router.get("/filters")
async def get_filters(
    current_user: models.User = Depends(auth.get_current_user)
):
    return market_service.get_market_filters()
