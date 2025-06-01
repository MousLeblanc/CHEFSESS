import Menu from '../models/Menu.js';
import Stock from '../models/Stock.js';
import asyncHandler from 'express-async-handler';


// @desc    Génère un menu à partir du stock utilisateur
// @route   POST /api/menus/generate
// @access  Private
export const generateMenu = asyncHandler(async (req, res) => {
  const { mode = 'stock-only', servings = 4, theme = 'Classique' } = req.body;

  const stock = await Stock.findOne({ user: req.user.id });
  if (!stock || stock.items.length === 0) {
    res.status(400);
    throw new Error('Stock insuffisant ou inexistant.');
  }

  const availableItems = stock.items.filter(item => item.quantity > 0);
  if (availableItems.length < 6) {
    res.status(400);
    throw new Error('Pas assez d’ingrédients pour générer un menu.');
  }

  const sampleIngredients = availableItems.slice(0, 6);
  const buildCourse = (type, name, startIdx) => ({
    type,
    name,
    ingredients: sampleIngredients.slice(startIdx, startIdx + 2).map(item => ({
      name: item.name,
      quantity: 100,
      unit: item.unit,
      inStock: true
    })),
    instructions: `Préparer le plat ${name}.`,
    preparationTime: 10,
    cookingTime: 15,
    servings
  });

  const menu = new Menu({
    user: req.user.id,
    title: `Menu ${theme}`,
    mode,
    theme,
    courses: [
      buildCourse('entrée', 'Entrée du jour', 0),
      buildCourse('plat', 'Plat du jour', 2),
      buildCourse('dessert', 'Dessert du jour', 4)
    ],
    stockUpdated: false
  });

  await menu.save();

  res.status(201).json({
    success: true,
    data: menu
  });
});

export const generateWeeklyMenu = asyncHandler(async (req, res) => {
  const { startDate } = req.body;
  const baseDate = new Date(startDate);
  const menus = [];

  // Charger le stock utilisateur
  const stock = await Stock.findOne({ user: req.user.id });
  if (!stock || stock.items.length < 6) {
    res.status(400);
    throw new Error('Stock insuffisant ou inexistant.');
  }

  const availableItems = stock.items.filter(item => item.quantity > 0);
  const ingredients = availableItems.map(i => ({
    name: i.name,
    quantity: i.quantity,
    unit: i.unit
  }));

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    // Appel à OpenAI pour générer un menu structuré
    const { entree, plat, dessert } = await generateMenuFromStock(ingredients, date.toLocaleDateString('fr-FR'));

    const menu = new Menu({
      user: req.user.id,
      title: `Menu du ${date.toLocaleDateString('fr-FR')}`,
      mode: 'ai',
      theme: 'Généré par IA',
      date,
      courses: [
        {
          type: 'entrée',
          name: entree,
          ingredients: [],
          instructions: '',
          servings: 4
        },
        {
          type: 'plat',
          name: plat,
          ingredients: [],
          instructions: '',
          servings: 4
        },
        {
          type: 'dessert',
          name: dessert,
          ingredients: [],
          instructions: '',
          servings: 4
        }
      ]
    });

    await menu.save();
    menus.push(menu);
  }

  res.status(201).json({ success: true, menus });
});


// @desc    Get all menus
// @route   GET /api/menus
// @access  Public
export const getMenus = asyncHandler(async (req, res) => {
  const menus = await Menu.find({});
  res.json(menus);
});

// @desc    Get single menu
// @route   GET /api/menus/:id
// @access  Private
export const getMenuById = asyncHandler(async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  if (menu) {
    res.json(menu);
  } else {
    res.status(404);
    throw new Error('Menu not found');
  }
});

// @desc    Create a menu
// @route   POST /api/menus
// @access  Private/Admin
export const createMenu = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  const menu = new Menu({
    name,
    description,
    price,
    category,
    user: req.user.id
  });

  const createdMenu = await menu.save();
  res.status(201).json(createdMenu);
});

// @desc    Update menu
// @route   PUT /api/menus/:id
// @access  Private/Admin
export const updateMenu = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;
  const menu = await Menu.findById(req.params.id);

  if (menu) {
    menu.name = name || menu.name;
    menu.description = description || menu.description;
    menu.price = price || menu.price;
    menu.category = category || menu.category;

    const updatedMenu = await menu.save();
    res.json(updatedMenu);
  } else {
    res.status(404);
    throw new Error('Menu not found');
  }
});

// @desc    Delete menu
// @route   DELETE /api/menus/:id
// @access  Private/Admin
export const deleteMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  if (menu) {
    await menu.remove();
    res.json({ message: 'Menu removed' });
  } else {
    res.status(404);
    throw new Error('Menu not found');
  }
});

export const getMenusByWeek = asyncHandler(async (req, res) => {
  const start = new Date(req.query.start);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const menus = await Menu.find({
    user: req.user.id,
    date: { $gte: start, $lte: end }
  });

  res.json(menus);
});

