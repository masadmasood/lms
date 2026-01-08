/*
  Category Controller
  
  Handles all category-related operations:
  - List all categories
  - Get category by ID
  - Create category (Admin only)
  - Update category (Admin only)
  - Delete category (Admin only)
*/

import Category from "../models/Category.js";
import Book from "../models/Book.js";
import { v4 as uuidv4 } from "uuid";

/*
  Get all categories
  Returns list of all active categories with book counts.
*/
export const getAllCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get category by ID
*/
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ categoryId: id });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Create a new category (Admin only)
*/
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Category name is required"
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists"
      });
    }

    const categoryId = `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newCategory = new Category({
      categoryId,
      name: name.trim(),
      description: description || '',
      icon: icon || '📚',
      color: color || '#6366f1'
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Update a category (Admin only)
*/
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await Category.findOne({ categoryId: id });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    // Check for duplicate name (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        categoryId: { $ne: id }
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          error: "Category with this name already exists"
        });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Delete a category (Admin only)
  Only deletes if no books are using this category.
*/
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ categoryId: id });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    // Check if any books are using this category
    const booksInCategory = await Book.countDocuments({ 
      category: { $regex: new RegExp(`^${category.name}$`, 'i') } 
    });

    if (booksInCategory > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. ${booksInCategory} book(s) are using this category.`
      });
    }

    await Category.deleteOne({ categoryId: id });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: { categoryId: id, name: category.name }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get unique categories from books (for seeding/migration)
*/
export const syncCategoriesFromBooks = async (req, res) => {
  try {
    // Get all unique categories from books
    const uniqueCategories = await Book.distinct('category');
    
    const results = {
      created: [],
      existing: [],
      errors: []
    };

    for (const categoryName of uniqueCategories) {
      try {
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });

        if (existingCategory) {
          // Update book count
          const bookCount = await Book.countDocuments({ 
            category: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
          });
          existingCategory.bookCount = bookCount;
          await existingCategory.save();
          results.existing.push(categoryName);
        } else {
          // Create new category
          const bookCount = await Book.countDocuments({ 
            category: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
          });
          
          const categoryId = `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          
          const newCategory = new Category({
            categoryId,
            name: categoryName,
            bookCount
          });
          
          await newCategory.save();
          results.created.push(categoryName);
        }
      } catch (err) {
        results.errors.push({ category: categoryName, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Categories synchronized from books",
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
