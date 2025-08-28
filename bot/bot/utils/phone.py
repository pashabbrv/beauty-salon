def simple_phone_to_id(phone: str) -> str:
    result = ''
    if phone.startswith('+'):
        result = phone[1:]
    elif phone.startswith('0'):
        result = '996'
    elif phone.startswith('8'):
        result = '7'
    if not phone.endswith('@c.us'):
        result += '@c.us'
    return result
