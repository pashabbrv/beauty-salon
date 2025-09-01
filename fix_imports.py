#!/usr/bin/env python3
"""
Скрипт для исправления импортов в backend файлах для Docker
"""
import os
import re

def fix_imports_in_file(file_path):
    """Исправляет импорты в одном файле"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Паттерны для замены импортов
    patterns = [
        (r'from core\.', 'from app.core.'),
        (r'from db\.', 'from app.db.'),
        (r'from api\.', 'from app.api.'),
        (r'from ws\.', 'from app.ws.'),
        (r'import core\.', 'import app.core.'),
        (r'import db\.', 'import app.db.'),
        (r'import api\.', 'import app.api.'),
        (r'import ws\.', 'import app.ws.'),
    ]
    
    modified = False
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Исправлен: {file_path}")
        return True
    return False

def fix_backend_imports():
    """Исправляет импорты во всех Python файлах backend"""
    backend_dir = 'c:/Users/danya/beauty-salon/backend'
    fixed_count = 0
    
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                if fix_imports_in_file(file_path):
                    fixed_count += 1
    
    print(f"Всего исправлено файлов: {fixed_count}")

if __name__ == '__main__':
    fix_backend_imports()