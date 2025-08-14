from fastapi import APIRouter

from .basic_routes import basic_router
from .slots_routes import slots_router


offerings_router = APIRouter(prefix='/offerings')

child_routers = [basic_router, slots_router]
for router in child_routers:
    offerings_router.include_router(router)
