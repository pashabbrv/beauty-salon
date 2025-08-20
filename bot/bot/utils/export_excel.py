import pandas as pd

def export_clients() -> str:
    # Предположим, данные подтягиваются из БД
    clients = [
        {"Имя": "Анна", "Телефон": "+79991234567", "Визитов": 5, "Последний визит": "2025-07-21"},
        {"Имя": "Олег", "Телефон": "+79999887766", "Визитов": 2, "Последний визит": "2025-07-18"},
    ]
    df = pd.DataFrame(clients)
    file_path = "clients.xlsx"
    df.to_excel(file_path, index=False)
    return f"Клиентская база экспортирована: {file_path}"
