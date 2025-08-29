from datetime import date, datetime, time, timedelta

from .config import slots


def generate_time_slots_for_now(duration_h: int, duration_m: int) -> list[datetime]:
    """Генерация всех слотов для услуги мастера, начиная с текущего времени."""
    time_slots = []
    today = date.today()
    now = datetime.now()  # Текущие дата и время
    
    for day in range(slots.SLOTS_DAYS):
        current_date = today + timedelta(days=day)
        
        # Начальное время для дня (но не раньше текущего момента)
        day_start = datetime.combine(
            current_date, 
            time(slots.START_HOURS, slots.START_MINUTES)
        )
        if day == 0:
            current_minute = now.minute
            rounded_minute = (current_minute // slots.INTERVAL_MINUTES) * slots.INTERVAL_MINUTES
            now = now.replace(minute=rounded_minute, second=0, microsecond=0)
            day_start = max(day_start, now)
        
        # Конечное время с учётом длительности услуги
        day_end = datetime.combine(
            current_date,
            time(slots.END_HOURS, slots.END_MINUTES)
        ) - timedelta(hours=duration_h, minutes=duration_m)
        
        # Генерация слотов
        current_slot = day_start
        while current_slot <= day_end:
            time_slots.append(current_slot)
            current_slot += timedelta(minutes=slots.INTERVAL_MINUTES)
    
    return time_slots


def is_slot_busy(
    slot: datetime,
    busy_intervals: list[tuple[datetime, datetime]],
    offering_duration: timedelta
) -> bool:
    """Проверка слота в зависимости от занятости мастера"""
    for busy_start, busy_end in busy_intervals:
        # Проверяем, попадает ли слот в занятый интервал
        if busy_start - offering_duration < slot < busy_end:
            return True
    return False


def filter_busy_slots(
    slots: list[datetime],
    busy_intervals: list[tuple[datetime, datetime]],
    offering_duration_h: int,
    offering_duration_m: int
) -> list[datetime]:
    """Удаление слотов в зависимости от занятости мастера"""
    filtered_slots = []
    offering_duration = timedelta(
        hours=offering_duration_h,
        minutes=offering_duration_m
    )
    
    for slot in slots:
        if not is_slot_busy(slot, busy_intervals, offering_duration):
            filtered_slots.append(slot)
    
    return filtered_slots
