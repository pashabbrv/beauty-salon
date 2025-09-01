-- Добавление тестовых данных в beauty_salon базу данных

-- Очистка существующих данных (если есть)
DELETE FROM appointments;
DELETE FROM occupations;
DELETE FROM offerings;
DELETE FROM services;
DELETE FROM masters;
DELETE FROM customers;

-- Сброс автоинкремента
ALTER SEQUENCE services_id_seq RESTART WITH 1;
ALTER SEQUENCE masters_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE offerings_id_seq RESTART WITH 1;
ALTER SEQUENCE occupations_id_seq RESTART WITH 1;
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;

-- Добавление услуг
INSERT INTO services (name) VALUES 
('Классический маникюр'),
('Стрижка + укладка'),
('Окрашивание волос'),
('Педикюр SPA'),
('Макияж'),
('Наращивание ресниц'),
('Массаж лица'),
('Эпиляция');

-- Добавление мастеров
INSERT INTO masters (name, specialization, rating) VALUES 
('Анна Петрова', 'Топ-стилист', 4.9),
('Мария Иванова', 'Мастер маникюра', 4.8),
('Елена Смирнова', 'Визажист', 4.9),
('Ольга Козлова', 'Мастер по наращиванию', 4.7),
('Татьяна Волкова', 'Массажист', 4.8);

-- Добавление офферингов (услуга + мастер + цена + длительность)
INSERT INTO offerings (service_id, master_id, price, duration) VALUES 
-- Анна Петрова (стилист)
(2, 1, 3000, '02:00:00'), -- Стрижка + укладка
(3, 1, 5000, '03:00:00'), -- Окрашивание волос

-- Мария Иванова (маникюр)
(1, 2, 2500, '01:30:00'), -- Классический маникюр
(4, 2, 3500, '01:30:00'), -- Педикюр SPA

-- Елена Смирнова (визажист)
(5, 3, 2000, '01:00:00'), -- Макияж
(6, 3, 4000, '02:00:00'), -- Наращивание ресниц

-- Ольга Козлова (наращивание)
(6, 4, 3800, '01:45:00'), -- Наращивание ресниц

-- Татьяна Волкова (массаж)
(7, 5, 2200, '01:00:00'), -- Массаж лица
(8, 5, 1800, '00:45:00'); -- Эпиляция

-- Добавление тестового клиента
INSERT INTO customers (name, phone, status, visit_count, last_visit) VALUES 
('Тестовый клиент', '+996555123456', 'active', 0, NULL);

-- Проверка добавленных данных
SELECT 'Услуги:' as info, count(*) as count FROM services
UNION ALL
SELECT 'Мастера:', count(*) FROM masters  
UNION ALL
SELECT 'Офферинги:', count(*) FROM offerings
UNION ALL
SELECT 'Клиенты:', count(*) FROM customers;