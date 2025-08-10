from .appointments import appointments_router
# from .customers import customers_router
from .masters import masters_router
from .offerings import offerings_router
from .services import services_router


routers = [
    appointments_router,
    # customers_router,
    services_router,
    masters_router,
    offerings_router
]