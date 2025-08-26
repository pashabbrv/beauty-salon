from fastapi import APIRouter

from .notifications import notifications_router


appointments_router = APIRouter(prefix='/appointments')

child_routers = [notifications_router]
for router in child_routers:
    appointments_router.include_router(router)
