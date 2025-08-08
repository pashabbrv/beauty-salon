from .appointments import appointments_router
from .customers import customers_router
from .services import services_router


routers = [
    appointments_router, customers_router, services_router
]