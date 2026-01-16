import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, X, Pencil, Trash2, FolderTree } from "lucide-react";
import axios from "axios";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE = process.env.REACT_APP_API_BASE;

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [newCategory, setNewCategory] = useState({ name: "", items: "" });
    const [editCategory, setEditCategory] = useState({ id: "", name: "", items: "" });

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/getcategory`);
            setCategories(res.data.exsiting_data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddCategory = async () => {
        try {
            await axios.post(`${API_BASE}/categories`, newCategory);
            setShowModal(false);
            setNewCategory({ name: "", items: "" });
            fetchCategories();
        } catch (err) {
            console.error("Error adding category:", err);
        }
    };

    const handleEditCategory = async () => {
        try {
            await axios.put(`${API_BASE}/category/${editCategory.id}`, {
                name: editCategory.name,
                items: editCategory.items,
            });

            setShowEditModal(false);
            fetchCategories();
        } catch (err) {
            console.error("Error updating category:", err);
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await axios.delete(`${API_BASE}/category/${category._id}`);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Categories</h1>
                    <p className="text-gray-500 text-sm mt-1">Organize grievance categories and subcategories</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} className="mr-2" /> Add Category
                </button>
            </div>

            {/* Categories List */}
            {categories.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <FolderTree className="empty-state-icon" />
                        <p className="empty-state-title">No categories found</p>
                        <p className="empty-state-text">Add your first category to get started</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((cat, index) => (
                        <div key={cat._id} className="accordion-item">
                            <button
                                className="accordion-header"
                                onClick={() => toggleAccordion(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FolderTree className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold text-gray-800">{cat.name}</span>
                                        <p className="text-sm text-gray-500">
                                            {Array.isArray(cat.items) ? cat.items.length : 0} subcategories
                                        </p>
                                    </div>
                                </div>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="accordion-body">
                                    {/* Subcategories */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-600 mb-2">Subcategories:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(cat.items)
                                                ? cat.items
                                                : String(cat.items || "").split(",")
                                            ).map((item, i) => (
                                                <span key={i} className="badge badge-info">
                                                    {item.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => {
                                                setShowEditModal(true);
                                                setEditCategory({
                                                    id: cat._id,
                                                    name: cat.name,
                                                    items: Array.isArray(cat.items)
                                                        ? cat.items.join(", ")
                                                        : String(cat.items || ""),
                                                });
                                            }}
                                        >
                                            <Pencil size={14} className="mr-1" /> Edit
                                        </button>

                                        <button
                                            className="btn btn-sm text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() => handleDelete(cat)}
                                        >
                                            <Trash2 size={14} className="mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Category</h3>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="form-label">Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter category name"
                                    value={newCategory.name}
                                    onChange={(e) =>
                                        setNewCategory({ ...newCategory, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="form-label">Subcategories (comma separated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Item 1, Item 2, Item 3"
                                    value={newCategory.items}
                                    onChange={(e) =>
                                        setNewCategory({ ...newCategory, items: e.target.value })
                                    }
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate items with commas</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAddCategory}>
                                Save Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Category</h3>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowEditModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="form-label">Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editCategory.name}
                                    onChange={(e) =>
                                        setEditCategory({ ...editCategory, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="form-label">Subcategories (comma separated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editCategory.items}
                                    onChange={(e) =>
                                        setEditCategory({ ...editCategory, items: e.target.value })
                                    }
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate items with commas</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleEditCategory}>
                                Update Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
