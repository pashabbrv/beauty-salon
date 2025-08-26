import re
def normalize_phone(raw: str) -> str:
    if raw is None:
        return ""
    digits = re.sub(r"\D", "", str(raw))
    if digits.startswith("0") and len(digits) == 11:
        digits = "9" + digits[1:]
    return digits
