from fastapi import APIRouter

from .basic_routes import basic_router
from .confirmation_routes import confirmation_router


appointments_router = APIRouter(prefix='/appointments')

child_routers = [basic_router, confirmation_router]
for router in child_routers:
    appointments_router.include_router(router)
