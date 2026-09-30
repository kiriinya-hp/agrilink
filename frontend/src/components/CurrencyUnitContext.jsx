import React, { createContext, useContext, useState, useEffect } from 'react';
import { ArrowLeftRight, Scale, Package, Layers, Box } from 'lucide-react';

const CurrencyUnitContext = createContext();

export const UNIT_CONFIG = {
  kg: { key: 'kg', label: 'Per Kg', suffix: '/ kg', multiplier: 1.0, icon: Scale },
  bag50: { key: 'bag50', label: '50kg Bag', suffix: '/ 50kg bag', multiplier: 50.0, icon: Package },
  bag90: { key: 'bag90', label: '90kg Bag', suffix: '/ 90kg bag', multiplier: 90.0, icon: Layers },
  crate25: { key: 'crate25', label: 'Crate (25kg)', suffix: '/ crate', multiplier: 25.0, icon: Box }
};

export const USD_TO_KES = 130.0;

export function CurrencyUnitProvider({ children }) {
  // Saved user preferences in localStorage
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('agrilink_currency') || 'KES';
  });

  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('agrilink_unit') || 'kg';
  });

  useEffect(() => {
    localStorage.setItem('agrilink_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('agrilink_unit', unit);
  }, [unit]);

  // Formatter for flat totals (e.g. wallet balances, order grand totals)
  const formatMoney = (amountInUsd, opts = {}) => {
    const val = Number(amountInUsd) || 0;
    if (currency === 'KES') {
      const kes = Math.round(val * USD_TO_KES);
      return `KES ${kes.toLocaleString()}`;
    }
    return `$${val.toFixed(opts.decimals !== undefined ? opts.decimals : 2)}`;
  };

  // Formatter for produce unit rates based on active packaging unit
  const formatUnitRate = (pricePerKgUsd) => {
    const baseKgUsd = Number(pricePerKgUsd) || 0;
    const multiplier = UNIT_CONFIG[unit]?.multiplier || 1.0;
    const unitPriceUsd = baseKgUsd * multiplier;

    if (currency === 'KES') {
      const kes = Math.round(unitPriceUsd * USD_TO_KES);
      return {
        amount: `KES ${kes.toLocaleString()}`,
        suffix: UNIT_CONFIG[unit]?.suffix || '/ kg',
        full: `KES ${kes.toLocaleString()} ${UNIT_CONFIG[unit]?.suffix || '/ kg'}`
      };
    }

    return {
      amount: `$${unitPriceUsd.toFixed(2)}`,
      suffix: UNIT_CONFIG[unit]?.suffix || '/ kg',
      full: `$${unitPriceUsd.toFixed(2)} ${UNIT_CONFIG[unit]?.suffix || '/ kg'}`
    };
  };

  // Convert raw KES to USD
  const toUsd = (amountKes) => {
    return Number(amountKes || 0) / USD_TO_KES;
  };

  // Convert USD to raw KES
  const toKes = (amountUsd) => {
    return Math.round(Number(amountUsd || 0) * USD_TO_KES);
  };

  return (
    <CurrencyUnitContext.Provider
      value={{
        currency,
        setCurrency,
        unit,
        setUnit,
        formatMoney,
        formatUnitRate,
        toUsd,
        toKes,
        rate: USD_TO_KES,
        unitConfig: UNIT_CONFIG
      }}
    >
      {children}
    </CurrencyUnitContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyUnitContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyUnitProvider');
  }
  return context;
}

// Global Header Control Bar Component
export function CurrencyUnitBar() {
  const { currency, setCurrency, unit, setUnit, unitConfig } = useCurrency();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* KES / USD Toggle */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-extrabold shadow-2xs">
        <button
          type="button"
          onClick={() => setCurrency('KES')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            currency === 'KES'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Display all prices and balances in Kenyan Shillings (KES)"
        >
          <span>🇰🇪 KES</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            currency === 'USD'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Display all prices and balances in US Dollars ($)"
        >
          <span>🇺🇸 USD</span>
        </button>
      </div>

      {/* Packaging Unit Switcher */}
      <div className="hidden lg:flex items-center bg-white p-0.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
        <span className="text-[10px] uppercase font-mono text-slate-400 px-2 font-bold">Unit:</span>
        {Object.values(unitConfig).map((u) => {
          const Icon = u.icon;
          const isActive = unit === u.key;
          return (
            <button
              key={u.key}
              type="button"
              onClick={() => setUnit(u.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={`View catalog prices converted to ${u.label}`}
            >
              <Icon className="w-3 h-3" />
              <span>{u.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
