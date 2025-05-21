import Menu from '../models/menuModel.js';
import asyncHandler from 'express-async-handler';

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
    user: req.user._id
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