import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, UserCheck, UserX, Mail, Phone, MapPin } from "lucide-react";

const CitizensPage = () => {
    const [citizens, setCitizens] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedState, setSelectedState] = useState("");
    const [selectedStateCode, setSelectedStateCode] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

    useEffect(() => {
        fetchCitizens();
        fetchStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCitizens = async () => {
        try {
            const res = await axios.get(`${API_BASE}/superadmin/citizens`, {
                params: {
                    state: selectedState,
                    district: selectedDistrict,
                },
            });
            setCitizens(res.data.citizens || []);
        } catch (error) {
            console.error("Error fetching citizens:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/state`);
            setStates(res.data || []);
        } catch (error) {
            console.error("Error fetching states:", error);
        }
    };

    const handleStateChange = async (stateCode) => {
        setSelectedStateCode(stateCode);

        const selected = states.find((s) => s["State Code"] === Number(stateCode));
        const stateName = selected ? selected["State Name"] : "";

        setSelectedState(stateName);
        setSelectedDistrict("");

        try {
            if (stateCode) {
                const res = await axios.get(`${API_BASE}/districts/${stateCode}`);
                setDistricts(res.data || []);
            } else {
                setDistricts([]);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }

        // Fetch citizens after state change
        setTimeout(() => fetchCitizens(), 100);
    };

    const handleDistrictChange = (district) => {
        setSelectedDistrict(district);
        setTimeout(() => fetchCitizens(), 100);
    };

    const toggleBlock = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "blocked" ? "active" : "blocked";
            await axios.put(`${API_BASE}/superadmin/citizens/${id}/status`, {
                status: newStatus,
            });
            fetchCitizens();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Filter citizens by search term
    const filteredCitizens = citizens.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm)
    );

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
                    <h1 className="page-title">Manage Users</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage registered citizens</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="stat-card py-2 px-4">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">{citizens.length} Users</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Search by name, email, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* State Filter */}
                    <select
                        className="form-select w-56"
                        value={selectedStateCode}
                        onChange={(e) => handleStateChange(e.target.value)}
                    >
                        <option value="">All States</option>
                        {states.map((state) => (
                            <option key={state._id} value={state["State Code"]}>
                                {state["State Name"]}
                            </option>
                        ))}
                    </select>

                    {/* District Filter */}
                    <select
                        className="form-select w-56"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={!selectedStateCode}
                    >
                        <option value="">All Districts</option>
                        {districts.map((dist) => (
                            <option key={dist._id} value={dist["District Name"]}>
                                {dist["District Name"]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Grid */}
            {filteredCitizens.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Users className="empty-state-icon" />
                        <p className="empty-state-title">No users found</p>
                        <p className="empty-state-text">Try adjusting your search or filters</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCitizens.map((user) => (
                        <div key={user._id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-lg">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                                        <span className={`badge ${user.status === "blocked" ? "badge-danger" : "badge-success"}`}>
                                            {user.status === "blocked" ? "Blocked" : "Active"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{user.mobile || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{user.district ? `${user.district}, ${user.state}` : user.state || "—"}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleBlock(user._id, user.status)}
                                    className={`btn btn-sm w-full ${
                                        user.status === "blocked"
                                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"
                                    }`}
                                >
                                    {user.status === "blocked" ? (
                                        <>
                                            <UserCheck className="h-4 w-4 mr-1" /> Unblock User
                                        </>
                                    ) : (
                                        <>
                                            <UserX className="h-4 w-4 mr-1" /> Block User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Showing count */}
            <div className="text-sm text-gray-500">
                Showing {filteredCitizens.length} of {citizens.length} users
            </div>
        </div>
    );
};

export default CitizensPage;
