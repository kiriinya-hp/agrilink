import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, Search, Filter, Trash2, Edit3, RefreshCw, AlertTriangle, 
  CheckCircle2, MapPin, User, Calendar, Tag, DollarSign, Layers,
  ExternalLink, Eye, EyeOff, ShieldCheck, X, Image as ImageIcon, Camera,
  Save, Loader2
} from 'lucide-react';
import { resolveProduceImage } from '../utils/cropImageMap';
import ImagePickerModal from './ImagePickerModal';

export default function AdminProduceManagement({ token, apiBase, onProduceUpdated }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Delete modal state
  const [deleteModalListing, setDeleteModalListing] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Edit modal state
  const [editModalListing, setEditModalListing] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchListings = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`${apiBase}/listings`);
      const data = await res.json();
      if (data.success && Array.isArray(data.listings)) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Failed to fetch produce listings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [apiBase]);

  const handleDeleteListing = async () => {
    if (!deleteModalListing) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/admin/listings/${deleteModalListing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`"${deleteModalListing.cropName}" was permanently removed from Harvest Marketplace.`);
        setListings(prev => prev.filter(l => l.id !== deleteModalListing.id));
        setDeleteModalListing(null);
        if (onProduceUpdated) onProduceUpdated();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || 'Failed to delete produce listing');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting product.');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditModalListing(item);
    setEditFormData({
      cropName: item.cropName || '',
      category: item.category || 'HORTICULTURE',
      availableQty: item.availableQty || 0,
      unit: item.unit || 'kg',
      unitPrice: item.unitPrice || 0,
      grade: item.grade || 'GRADE_A',
      location: item.location || '',
      status: item.status || 'ACTIVE',
      imageUrl: item.imageUrl || resolveProduceImage(item.imageUrl, item.cropName, item.category)
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModalListing) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${apiBase}/listings/${editModalListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: editFormData.cropName,
          category: editFormData.category,
          availableQty: parseFloat(editFormData.availableQty),
          unitPrice: parseFloat(editFormData.unitPrice),
          unit: editFormData.unit,
          grade: editFormData.grade,
          location: editFormData.location,
          status: editFormData.status,
          imageUrl: editFormData.imageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map(l => l.id === editModalListing.id ? { ...l, ...data.listing } : l));
        setActionSuccess(`"${editFormData.cropName}" was updated successfully.`);
        setEditModalListing(null);
        if (onProduceUpdated) onProduceUpdated();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || 'Failed to update produce listing');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Network error while updating product.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUpdateStatus = async (listingId, newStatus) => {
    try {
      const res = await fetch(`${apiBase}/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
        if (onProduceUpdated) onProduceUpdated();
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      // Category filter
      if (categoryFilter !== 'ALL' && l.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && l.status !== statusFilter) {
        return false;
      }
      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const crop = (l.cropName || '').toLowerCase();
      const loc = (l.location || '').toLowerCase();
      const farmer = (l.farmer?.name || '').toLowerCase();
      return crop.includes(term) || loc.includes(term) || farmer.includes(term);
    });
  }, [listings, categoryFilter, statusFilter, searchTerm]);

  const categories = useMemo(() => {
    const set = new Set();
    listings.forEach(l => { if (l.category) set.add(l.category); });
    return Array.from(set);
  }, [listings]);

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'HORTICULTURE': return '🥦';
      case 'TUBER': return '🥔';
      case 'CEREAL': return '🌽';
      case 'DAIRY': return '🥛';
      case 'LIVESTOCK': return '🐄';
      case 'POULTRY': return '🐔';
      case 'FODDER_FEEDS': return '🌾';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Produce & Harvest Catalog Management</h2>
              <p className="text-xs text-slate-500">Edit product pictures, details, prices, or delete live farmer listings.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchListings(true)}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono">
            {filteredListings.length} Products
          </span>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-slideDown shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search produce name, county, or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="SOLD_OUT">SOLD OUT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produce Listings Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading live produce catalog...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-xs font-semibold">No produce listings found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Produce / Crop</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Stock Available</th>
                  <th className="py-3 px-3">Price (USD / KES)</th>
                  <th className="py-3 px-3">Location & Farmer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((item) => {
                  const priceKes = Math.round(item.unitPrice * 130);
                  const displayImage = resolveProduceImage(item.imageUrl, item.cropName, item.category);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImage}
                            alt={item.cropName}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{item.cropName}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                              <span className="font-mono text-slate-500">ID: {item.id.slice(-6)}</span>
                              <span>•</span>
                              <span>Grade: <strong className="text-slate-600">{item.grade || 'STANDARD'}</strong></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {getCategoryEmoji(item.category)} {item.category}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.availableQty}
                        </span>
                        <span className="text-slate-500 ml-1 font-medium">{item.unit || 'kg'}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3">
                        <p className="font-black text-slate-900 text-sm">${item.unitPrice.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-emerald-600">KES {priceKes.toLocaleString()} / {item.unit || 'kg'}</p>
                      </td>

                      {/* Location & Producer */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{item.location || 'Kenya'}</span>
                        </p>
                        {item.farmer?.name && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.farmer.name}</span>
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <select
                          value={item.status || 'ACTIVE'}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-black border outline-none cursor-pointer ${
                            item.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : item.status === 'RESERVED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="SOLD_OUT">SOLD OUT</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200 transition-colors shadow-2xs"
                            title="Edit product picture, details, price and stock"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModalListing(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 border border-rose-200 transition-colors shadow-2xs"
                            title="Permanently delete product from Harvest Marketplace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCE MODAL (Live Picture & Details Editing) ── */}
      {editModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Product Listing</h3>
                  <p className="text-xs text-slate-500">Update photo, pricing, stock and details directly in database.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditModalListing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Image Preview & URL Row */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0 relative group">
                    <img
                      src={editFormData.imageUrl || resolveProduceImage(editFormData.imageUrl, editFormData.cropName, editFormData.category)}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-white font-bold">Preview</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Product Picture (Image URL or Upload)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.example.com/produce.jpg"
                      value={editFormData.imageUrl || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Gallery / Upload Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Crop Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product / Crop Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.cropName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, cropName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editFormData.category || 'HORTICULTURE'}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="HORTICULTURE">🥦 HORTICULTURE</option>
                    <option value="TUBER">🥔 TUBER</option>
                    <option value="CEREAL">🌽 CEREAL</option>
                    <option value="DAIRY">🥛 DAIRY</option>
                    <option value="LIVESTOCK">🐄 LIVESTOCK</option>
                    <option value="POULTRY">🐔 POULTRY</option>
                    <option value="FODDER_FEEDS">🌾 FODDER & FEEDS</option>
                  </select>
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
                  <select
                    value={editFormData.grade || 'GRADE_A'}
                    onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="GRADE_A">Grade A (Premium Export)</option>
                    <option value="GRADE_B">Grade B (Standard Market)</option>
                    <option value="GRADE_C">Grade C (Processing/Bulk)</option>
                    <option value="EXPORT_QUALITY">Export Quality</option>
                    <option value="CERTIFIED_ORGANIC">Certified Organic</option>
                  </select>
                </div>

                {/* Stock Available */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editFormData.availableQty ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, availableQty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={editFormData.unit || 'kg'}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="bags">bags (90kg / 50kg Bags)</option>
                    <option value="crates">crates (Wooden / Plastic Crates)</option>
                    <option value="heads">heads (Animals / Livestock)</option>
                    <option value="liters">liters (Milk / Liquids)</option>
                    <option value="trays">trays (Egg Trays 30pcs)</option>
                    <option value="bales">bales (Hay / Silage)</option>
                  </select>
                </div>

                {/* Price (USD + KES preview) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Unit Price (USD)</label>
                    <span className="text-[10px] font-bold text-emerald-600">
                      ≈ KES {Math.round((Number(editFormData.unitPrice) || 0) * 130).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editFormData.unitPrice ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Listing Status</label>
                  <select
                    value={editFormData.status || 'ACTIVE'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE (Visible on Marketplace)</option>
                    <option value="RESERVED">RESERVED (In escrow negotiation)</option>
                    <option value="SOLD_OUT">SOLD OUT</option>
                  </select>
                </div>

                {/* Farm Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Origin / Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. Narok South Plains, Narok County"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalListing(null)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Picker Modal for Admin Edit */}
      {showImagePicker && (
        <ImagePickerModal
          currentUrl={editFormData.imageUrl}
          cropName={editFormData.cropName}
          onSelect={(url) => {
            setEditFormData(prev => ({ ...prev, imageUrl: url }));
            setShowImagePicker(false);
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Produce Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={resolveProduceImage(deleteModalListing.imageUrl, deleteModalListing.cropName, deleteModalListing.category)}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
                <div>
                  <p className="font-bold text-slate-900">{deleteModalListing.cropName}</p>
                  <p className="text-slate-500 text-[11px]">{deleteModalListing.category} • {deleteModalListing.location}</p>
                </div>
              </div>
              <p className="text-slate-600">
                Are you sure you want to delete this product from the **Harvest Marketplace**? It will be permanently removed from MongoDB Atlas and buyers will no longer be able to place orders against it.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalListing(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting from DB...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
