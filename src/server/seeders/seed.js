const { sequelize, User, Customer, Freelancer, Admin, Category, Service } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('База данных очищена');

    // Создание категорий
    const categories = await Category.bulkCreate([
      { name: 'Веб-разработка', description: 'Создание сайтов и веб-приложений' },
      { name: 'Дизайн', description: 'Графический и UI/UX дизайн' },
      { name: 'Копирайтинг', description: 'Написание текстов и контента' },
      { name: 'Маркетинг', description: 'Продвижение и реклама' },
      { name: 'Видео и аудио', description: 'Монтаж видео и обработка звука' },
      { name: 'Переводы', description: 'Письменные и устные переводы' },
    ]);
    console.log('Категории созданы');

    // Создание админа
    const adminUser = await User.create({
      login: 'admin',
      email: 'admin@platform.ru',
      password: 'admin123',
      role: 'admin',
    });
    await Admin.create({ userId: adminUser.id, accessLevel: 'full' });
    console.log('Админ создан (admin@platform.ru / admin123)');

    // Создание заказчика
    const customerUser = await User.create({
      login: 'IvanCustomer',
      email: 'customer@platform.ru',
      password: 'customer123',
      role: 'customer',
    });
    await Customer.create({ userId: customerUser.id });
    console.log('Заказчик создан (customer@platform.ru / customer123)');

    // Создание фрилансеров
    const freelancer1User = await User.create({
      login: 'AlexDev',
      email: 'alex@platform.ru',
      password: 'freelancer123',
      role: 'freelancer',
    });
    const freelancer1 = await Freelancer.create({
      userId: freelancer1User.id,
      rating: 4.8,
      description: 'Опытный веб-разработчик с 5-летним стажем. Специализируюсь на React, Node.js и PostgreSQL.',
    });

    const freelancer2User = await User.create({
      login: 'DesignMaster',
      email: 'design@platform.ru',
      password: 'freelancer123',
      role: 'freelancer',
    });
    const freelancer2 = await Freelancer.create({
      userId: freelancer2User.id,
      rating: 4.5,
      description: 'UI/UX дизайнер с опытом работы в крупных проектах.',
    });

    const freelancer3User = await User.create({
      login: 'WriterPro',
      email: 'writer@platform.ru',
      password: 'freelancer123',
      role: 'freelancer',
    });
    const freelancer3 = await Freelancer.create({
      userId: freelancer3User.id,
      rating: 4.2,
      description: 'Копирайтер с опытом написания текстов для бизнеса.',
    });
    console.log('Фрилансеры созданы');

    // Создание услуг
    await Service.bulkCreate([
      { freelancerId: freelancer1.id, categoryId: categories[0].id, name: 'Разработка лендинга', description: 'Создание одностраничного сайта', price: 15000 },
      { freelancerId: freelancer1.id, categoryId: categories[0].id, name: 'Разработка SPA', description: 'Создание одностраничного приложения на React', price: 50000 },
      { freelancerId: freelancer2.id, categoryId: categories[1].id, name: 'Дизайн лендинга', description: 'Разработка уникального дизайна', price: 10000 },
      { freelancerId: freelancer3.id, categoryId: categories[2].id, name: 'Статья для блога', description: 'SEO-оптимизированная статья', price: 2000 },
    ]);
    console.log('Услуги созданы');

    console.log('\nСиды успешно добавлены!');
    console.log('Тестовые аккаунты:');
    console.log('  Админ: admin@platform.ru / admin123');
    console.log('  Заказчик: customer@platform.ru / customer123');
    console.log('  Фрилансеры: alex@platform.ru, design@platform.ru, writer@platform.ru / freelancer123');
  } catch (error) {
    console.error('Ошибка при добавлении сидов:', error);
  } finally {
    await sequelize.close();
  }
};

seed();