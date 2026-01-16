import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [stateCode, setStateCode] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [districtFilter, setDistrictFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.REACT_APP_API_BASE;

    // Add Staff Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addDistricts, setAddDistricts] = useState([]);

    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        mobile: "",
        state: "",
        district: "",
        category: ""
    });

    // Edit Staff Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [editDistricts, setEditDistricts] = useState([]);

    // Delete Popup
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchStates = async () => {
        const res = await axios.get(`${API_BASE}/state`);
        setStates(res.data || []);
    };

    const fetchCategories = async () => {
        const res = await axios.get(`${API_BASE}/getcategory`);
        setCategories(res.data.exsiting_data || []);
    };

    const fetchDistricts = async (code) => {
        if (!code) return setDistricts([]);
        const res = await axios.get(`${API_BASE}/districts/${code}`);
        setDistricts(res.data || []);
    };

    const fetchStaff = async (overrideState = stateFilter, overrideDistrict = districtFilter) => {
        try {
            let params = {};
            if (overrideState) params.state = overrideState;
            if (overrideDistrict) params.district = overrideDistrict;

            const res = await axios.get(`${API_BASE}/superadmin/staff`, { params });
            setStaff(res.data.staff || []);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStates();
        fetchCategories();
        fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStateChange = (e) => {
        const code = e.target.value;

        if (!code) {
            setStateCode("");
            setStateFilter("");
            setDistrictFilter("");
            setDistricts([]);
            fetchStaff("", "");
            return;
        }

        const selected = states.find(s => String(s["State Code"]) === String(code));
        const stateName = selected ? selected["State Name"] : "";

        setStateCode(code);
        setStateFilter(stateName);
        setDistrictFilter("");

        fetchDistricts(code);
        fetchStaff(stateName, "");
    };

    const handleDistrictChange = (e) => {
        const district = e.target.value;
        setDistrictFilter(district);
        fetchStaff(stateFilter, district);
    };

    const fetchAddDistricts = async (code) => {
        if (!code) return setAddDistricts([]);
        const res = await axios.get(`${API_BASE}/districts/${code}`);
        setAddDistricts(res.data || []);
    };

    const handleAddStateChange = (e) => {
        const code = e.target.value;
        setNewStaff({ ...newStaff, state: code, district: "" });
        fetchAddDistricts(code);
    };

    const handleAddInput = (e) => {
        setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        const selectedState = states.find(s => String(s["State Code"]) === String(newStaff.state));
        const stateName = selectedState ? selectedState["State Name"] : "";

        const payload = {
            name: newStaff.name,
            email: newStaff.email,
            mobile: newStaff.mobile,
            state: stateName,
            district: newStaff.district,
            category: newStaff.category
        };

        await axios.post(`${API_BASE}/superadmin/addstaff`, payload);

        setShowAddModal(false);
        fetchStaff();

        setNewStaff({
            name: "",
            email: "",
            mobile: "",
            state: "",
            district: "",
            category: ""
        });
    };

    const openEditModal = async (row) => {
        setEditStaff(row);

        const selected = states.find(s => s["State Name"] === row.state);
        const code = selected ? selected["State Code"] : "";

        if (code) {
            const res = await axios.get(`${API_BASE}/districts/${code}`);
            setEditDistricts(res.data || []);
        }

        setShowEditModal(true);
    };

    const handleEditInput = (e) => {
        setEditStaff({ ...editStaff, [e.target.name]: e.target.value });
    };

    const handleEditStateChange = async (e) => {
        const code = e.target.value;

        const selectedState = states.find(s => String(s["State Code"]) === String(code));
        const stateName = selectedState ? selectedState["State Name"] : "";

        const res = await axios.get(`${API_BASE}/districts/${code}`);

        setEditDistricts(res.data || []);
        setEditStaff({ ...editStaff, state: stateName, district: "" });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        await axios.patch(`${API_BASE}/superadmin/updatestaff/${editStaff._id}`, editStaff);

        setShowEditModal(false);
        fetchStaff();
    };

    const handleDelete = async () => {
        await axios.delete(`${API_BASE}/superadmin/admin/${deleteId}`);
        setShowDeletePopup(false);
        fetchStaff();
    };

    const columns = [
        { header: "Name", accessor: "name" },
        { header: "Email", accessor: "email" },
        { 
            header: "Department", 
            accessor: "category",
            render: (row) => (
                <span className="badge badge-info">{row.category || '—'}</span>
            )
        },
        { header: "State", accessor: "state" },
        { header: "District", accessor: "district" },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        className="action-btn action-btn-edit"
                        onClick={() => openEditModal(row)}
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        className="action-btn action-btn-delete"
                        onClick={() => { setDeleteId(row._id); setShowDeletePopup(true); }}
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

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
                    <h1 className="page-title">Manage Staff</h1>
                    <p className="text-gray-500 text-sm mt-1">Add and manage staff members</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} className="mr-2" /> Add Staff
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="filter-bar">
                    <select className="form-select w-56" value={stateCode} onChange={handleStateChange}>
                        <option value="">All States</option>
                        {states.map((s, i) => (
                            <option key={i} value={s["State Code"]}>{s["State Name"]}</option>
                        ))}
                    </select>

                    <select 
                        className="form-select w-56" 
                        value={districtFilter}
                        onChange={handleDistrictChange} 
                        disabled={!stateCode}
                    >
                        <option value="">All Districts</option>
                        {districts.map((d, i) => (
                            <option key={i} value={d["District Name"]}>{d["District Name"]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={staff} />

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Staff</h3>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Name</label>
                                    <input 
                                        name="name" 
                                        className="form-input" 
                                        placeholder="Enter name" 
                                        required 
                                        value={newStaff.name} 
                                        onChange={handleAddInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input 
                                        name="email" 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="Enter email" 
                                        required 
                                        value={newStaff.email} 
                                        onChange={handleAddInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Mobile</label>
                                    <input 
                                        name="mobile" 
                                        className="form-input" 
                                        placeholder="Enter mobile" 
                                        required 
                                        value={newStaff.mobile} 
                                        onChange={handleAddInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">State</label>
                                    <select 
                                        name="state" 
                                        className="form-select" 
                                        required 
                                        value={newStaff.state} 
                                        onChange={handleAddStateChange}
                                    >
                                        <option value="">Select State</option>
                                        {states.map((s, i) => (
                                            <option key={i} value={s["State Code"]}>{s["State Name"]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">District</label>
                                    <select 
                                        name="district" 
                                        className="form-select" 
                                        required 
                                        value={newStaff.district}
                                        onChange={handleAddInput} 
                                        disabled={!newStaff.state}
                                    >
                                        <option value="">Select District</option>
                                        {addDistricts.map((d, i) => (
                                            <option key={i} value={d["District Name"]}>{d["District Name"]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Category</label>
                                    <select 
                                        name="category" 
                                        className="form-select" 
                                        required 
                                        value={newStaff.category} 
                                        onChange={handleAddInput}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {showEditModal && editStaff && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Staff</h3>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowEditModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Name</label>
                                    <input 
                                        name="name" 
                                        className="form-input" 
                                        required 
                                        value={editStaff.name} 
                                        onChange={handleEditInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input 
                                        name="email" 
                                        className="form-input" 
                                        required 
                                        value={editStaff.email} 
                                        onChange={handleEditInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Mobile</label>
                                    <input 
                                        name="mobile" 
                                        className="form-input" 
                                        required 
                                        value={editStaff.mobile} 
                                        onChange={handleEditInput} 
                                    />
                                </div>
                                <div>
                                    <label className="form-label">State</label>
                                    <select
                                        className="form-select"
                                        value={states.find(s => s["State Name"] === editStaff.state)?.["State Code"] || ""}
                                        onChange={handleEditStateChange}
                                    >
                                        <option value="">Select State</option>
                                        {states.map((s) => (
                                            <option key={s._id} value={s["State Code"]}>{s["State Name"]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">District</label>
                                    <select 
                                        name="district" 
                                        className="form-select" 
                                        required 
                                        value={editStaff.district} 
                                        onChange={handleEditInput}
                                    >
                                        <option value="">Select District</option>
                                        {editDistricts.map((d) => (
                                            <option key={d._id} value={d["District Name"]}>{d["District Name"]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Category</label>
                                    <select 
                                        name="category" 
                                        className="form-select" 
                                        required 
                                        value={editStaff.category} 
                                        onChange={handleEditInput}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeletePopup && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-sm">
                        <div className="modal-header border-0">
                            <h3 className="modal-title text-red-600">Delete Staff?</h3>
                        </div>

                        <div className="modal-body text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-gray-600">This action cannot be undone. Are you sure you want to delete this staff member?</p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeletePopup(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
