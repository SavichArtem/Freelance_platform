export const mockCategories = [
  { id: 1, name: 'Веб-разработка', description: 'Создание сайтов и веб-приложений', icon: '💻' },
  { id: 2, name: 'Дизайн', description: 'Графический и UI/UX дизайн', icon: '🎨' },
  { id: 3, name: 'Копирайтинг', description: 'Написание текстов и контента', icon: '✍️' },
  { id: 4, name: 'Маркетинг', description: 'Продвижение и реклама', icon: '📈' },
  { id: 5, name: 'Видео и аудио', description: 'Монтаж видео и обработка звука', icon: '🎬' },
  { id: 6, name: 'Переводы', description: 'Письменные и устные переводы', icon: '🌐' },
];

export const mockFreelancers = [
  {
    id: 1,
    login: 'AlexDev',
    email: 'alex@example.com',
    avatar: null,
    rating: 4.8,
    minPrice: 5000,
    Freelancer: {
      description: 'Опытный веб-разработчик с 5-летним стажем. Специализируюсь на React, Node.js и PostgreSQL.',
      services: [
        { id: 1, name: 'Разработка лендинга', description: 'Создание одностраничного сайта', price: 15000 },
        { id: 2, name: 'Разработка SPA', description: 'Создание одностраничного приложения на React', price: 50000 },
      ],
      portfolioItems: [
        { id: 1, title: 'Интернет-магазин', description: 'Полноценный магазин на React', image: null },
        { id: 2, title: 'Корпоративный сайт', description: 'Сайт для строительной компании', image: null },
      ],
    },
    reviews: [
      { id: 1, rating: 5, text: 'Отличная работа! Всё сделано качественно и в срок.', createdAt: '2024-03-15', author: 'IvanovI' },
      { id: 2, rating: 4, text: 'Хороший специалист, рекомендую.', createdAt: '2024-02-20', author: 'PetrovP' },
    ],
  },
  {
    id: 2,
    login: 'DesignMaster',
    email: 'design@example.com',
    avatar: null,
    rating: 4.5,
    minPrice: 3000,
    Freelancer: {
      description: 'UI/UX дизайнер с опытом работы в крупных проектах.',
      services: [
        { id: 3, name: 'Дизайн лендинга', description: 'Разработка уникального дизайна', price: 10000 },
      ],
      portfolioItems: [
        { id: 3, title: 'Редизайн банковского приложения', description: 'Обновление интерфейса мобильного банка', image: null },
      ],
    },
    reviews: [
      { id: 3, rating: 5, text: 'Очень креативный подход!', createdAt: '2024-04-01', author: 'SidorovS' },
    ],
  },
  {
    id: 3,
    login: 'WriterPro',
    email: 'writer@example.com',
    avatar: null,
    rating: 4.2,
    minPrice: 1000,
    Freelancer: {
      description: 'Копирайтер с опытом написания текстов для бизнеса.',
      services: [
        { id: 4, name: 'Статья для блога', description: 'SEO-оптимизированная статья', price: 2000 },
      ],
      portfolioItems: [],
    },
    reviews: [],
  },
];

export const mockUserProfile = {
  customer: {
    id: 101,
    login: 'IvanCustomer',
    email: 'ivan@example.com',
    role: 'customer',
    avatar: null,
    registrationDate: '2024-01-15',
    status: 'active',
  },
  freelancer: {
    id: 102,
    login: 'PetyaFreelancer',
    email: 'petya@example.com',
    role: 'freelancer',
    avatar: null,
    registrationDate: '2024-02-01',
    status: 'active',
  },
};