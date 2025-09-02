def simple_phone_to_id(phone: str) -> str:
    # Удаляем пробелы и специальные символы
    clean_phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Если уже в формате WhatsApp ID
    if clean_phone.endswith('@c.us'):
        return clean_phone
    
    # Убираем + в начале если есть
    if clean_phone.startswith('+'):
        clean_phone = clean_phone[1:]
    
    # Конвертируем в международный формат
    if clean_phone.startswith('0'):
        # Кыргызстан: 0XXX -> 996XXX
        result = '996' + clean_phone[1:]
    elif clean_phone.startswith('8'):
        # Россия: 8XXX -> 7XXX
        result = '7' + clean_phone[1:]
    else:
        # Уже в международном формате
        result = clean_phone
    
    # Добавляем суффикс WhatsApp
    return result + '@c.us'
