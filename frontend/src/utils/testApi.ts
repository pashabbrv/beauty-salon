// Простой тест API подключения
export const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/services/');
    if (response.ok) {
      const data = await response.json();
      console.log('API подключение успешно:', data);
      return data;
    } else {
      console.error('Ошибка API:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Ошибка подключения к API:', error);
    return null;
  }
};

// Функция для тестирования в консоли браузера
export const testAPI = () => {
  console.log('Тестируем подключение к API...');
  testApiConnection();
};