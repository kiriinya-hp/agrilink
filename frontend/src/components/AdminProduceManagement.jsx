import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, Search, Filter, Trash2, Edit3, RefreshCw, AlertTriangle, 
  CheckCircle2, MapPin, User, Calendar, Tag, DollarSign, Layers,
  ExternalLink, Eye, EyeOff, ShieldCheck, X
} from 'lucide-react';

export default function AdminProduceManagement({ token, apiBase, onProduceUpdated }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteModalListing, setDeleteModalListing] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
      const cat = (l.category || '').toLowerCase();
      const loc = (l.location || '').toLowerCase();
      const farmer = (l.farmer?.name || '').toLowerCase();
      return crop.includes(term) || cat.includes(term) || loc.includes(term) || farmer.includes(term);
    });
  }, [listings, categoryFilter, statusFilter, searchTerm]);

  // Categories breakdown stats
  const categoryCounts = useMemo(() => {
    const counts = {};
    listings.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'DAIRY': return '🥛';
      case 'LIVESTOCK': return '🐄';
      case 'POULTRY': return '🐔';
      case 'FODDER_FEEDS': return '🌿';
      case 'HORTICULTURE': return '🥬';
      case 'CEREAL': return '🌾';
      case 'TUBER': return '🥔';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Harvest Marketplace Inventory</h2>
            <p className="text-xs text-slate-500">Oversee, inspect and remove produce listings directly from MongoDB Atlas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchListings(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Catalog'}
          </button>
        </div>
      </div>

      {/* Category Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {[
          { key: 'ALL', label: 'All Items', count: listings.length, color: 'text-slate-900', bg: 'bg-white' },
          { key: 'DAIRY', label: 'Dairy', count: categoryCounts['DAIRY'] || 0, color: 'text-sky-700', bg: 'bg-sky-50/50' },
          { key: 'LIVESTOCK', label: 'Livestock', count: categoryCounts['LIVESTOCK'] || 0, color: 'text-lime-700', bg: 'bg-lime-50/50' },
          { key: 'POULTRY', label: 'Poultry', count: categoryCounts['POULTRY'] || 0, color: 'text-orange-700', bg: 'bg-orange-50/50' },
          { key: 'FODDER_FEEDS', label: 'Fodder', count: categoryCounts['FODDER_FEEDS'] || 0, color: 'text-teal-700', bg: 'bg-teal-50/50' },
          { key: 'HORTICULTURE', label: 'Horticulture', count: categoryCounts['HORTICULTURE'] || 0, color: 'text-emerald-700', bg: 'bg-emerald-50/50' },
          { key: 'CEREAL', label: 'Cereals', count: categoryCounts['CEREAL'] || 0, color: 'text-amber-700', bg: 'bg-amber-50/50' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setCategoryFilter(c.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              categoryFilter === c.key 
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50' 
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</p>
            <p className={`text-xl font-black ${c.color} mt-0.5`}>{c.count}</p>
          </button>
        ))}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by crop name, farmer, county/location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'All Categories' },
              { key: 'DAIRY', label: '🥛 Dairy' },
              { key: 'LIVESTOCK', label: '🐄 Livestock' },
              { key: 'POULTRY', label: '🐔 Poultry' },
              { key: 'FODDER_FEEDS', label: '🌿 Feeds & Fodder' },
              { key: 'HORTICULTURE', label: '🥬 Horticulture' },
              { key: 'CEREAL', label: '🌾 Cereals' },
              { key: 'TUBER', label: '🥔 Tubers' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  categoryFilter === cat.key 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produce Listings Table / Cards */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading Produce Inventory...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 px-4">
          <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No Harvest Products Found</p>
          <p className="text-xs text-slate-500 mt-1">Try switching category tabs or clearing your search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Product / Crop</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Available Stock</th>
                  <th className="py-3.5 px-3">Unit Price</th>
                  <th className="py-3.5 px-3">Location & Producer</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((item) => {
                  const priceKes = Math.round(item.unitPrice * 130);
                  const isSoldOut = item.status === 'SOLD_OUT';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                            alt={item.cropName}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
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
                        <button
                          onClick={() => setDeleteModalListing(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 border border-rose-200 transition-colors shadow-2xs"
                          title="Permanently delete product from Harvest Marketplace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
                  src={deleteModalListing.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
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
