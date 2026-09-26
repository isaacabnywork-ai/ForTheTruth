"use client";

import { useState, useRef, useEffect } from "react";
import { Field } from "@/components/ui/Field";
import { INDIAN_STATES_AND_CITIES, COUNTRY_CODES } from "@/utils/indianStatesCities";

export interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface AddressFormProps {
  prefix: string;
  address: AddressData;
  onChange: (address: AddressData) => void;
}

export function AddressForm({ prefix, address, onChange }: AddressFormProps) {
  // Parse country code from phone or default to +91
  const [countryCode, setCountryCode] = useState(() => {
    for (const item of COUNTRY_CODES) {
      if (address.phone.startsWith(item.code)) {
        return item.code;
      }
    }
    return "+91";
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    for (const item of COUNTRY_CODES) {
      if (address.phone.startsWith(item.code)) {
        return address.phone.slice(item.code.length).trim();
      }
    }
    return address.phone.replace(/^\+91\s*/, "");
  });

  // State & City dropdown states
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setShowStateSuggestions(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update full phone when either code or number changes
  const handlePhoneChange = (newCode: string, newNumber: string) => {
    setCountryCode(newCode);
    setPhoneNumber(newNumber);
    const cleaned = newNumber.trim();
    onChange({
      ...address,
      phone: cleaned ? `${newCode} ${cleaned}` : "",
    });
  };

  // Filter states based on user typing
  const allStates = Object.keys(INDIAN_STATES_AND_CITIES);
  const matchingStates = allStates.filter((s) =>
    s.toLowerCase().includes(address.state.toLowerCase().trim())
  );

  // Filter cities based on selected/typed state and user typing in city field
  const exactStateMatch = allStates.find(
    (s) => s.toLowerCase() === address.state.toLowerCase().trim()
  );
  // If state matches or is close, get those cities, otherwise gather all cities or empty
  const availableCities = exactStateMatch
    ? INDIAN_STATES_AND_CITIES[exactStateMatch]
    : [];
  const matchingCities = availableCities.filter((c) =>
    c.toLowerCase().includes(address.city.toLowerCase().trim())
  );

  return (
    <div className="space-y-4">
      {/* 1. First & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          id={`${prefix}-fn`}
          label="First name"
          required
          value={address.firstName}
          onChange={(e) => onChange({ ...address, firstName: e.target.value })}
        />
        <Field
          id={`${prefix}-ln`}
          label="Last name"
          required
          value={address.lastName}
          onChange={(e) => onChange({ ...address, lastName: e.target.value })}
        />
      </div>

      {/* 2. Email */}
      <Field
        id={`${prefix}-em`}
        label="Email"
        type="email"
        required
        value={address.email}
        onChange={(e) => onChange({ ...address, email: e.target.value })}
      />

      {/* 3. Phone Number with Country Code */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-ph`} className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="flex items-stretch rounded-xl border border-sand bg-white shadow-inner focus-within:border-gold-dark focus-within:ring-2 focus-within:ring-gold/30 transition-all overflow-hidden">
          <select
            value={countryCode}
            onChange={(e) => handlePhoneChange(e.target.value, phoneNumber)}
            className="bg-cream/60 border-r border-sand px-3 py-2.5 text-xs font-bold text-navy focus:outline-none focus:bg-white transition-colors cursor-pointer"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.country.split(" ")[0]})
              </option>
            ))}
          </select>
          <input
            id={`${prefix}-ph`}
            type="tel"
            required
            placeholder="7355362010"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(countryCode, e.target.value)}
            className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-navy placeholder:text-charcoal/40 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Street Address */}
      <Field
        id={`${prefix}-ad`}
        label="Street address"
        required
        value={address.address1}
        onChange={(e) => onChange({ ...address, address1: e.target.value })}
      />

      {/* 5. STATE First (on left), CITY Second (on right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* STATE INPUT WITH AUTOCOMPLETE */}
        <div className="relative" ref={stateRef}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${prefix}-st`} className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
              State <span className="text-red-500">*</span>
            </label>
            <input
              id={`${prefix}-st`}
              type="text"
              required
              autoComplete="address-level1"
              placeholder="e.g. Uttar Pradesh"
              value={address.state}
              onFocus={() => setShowStateSuggestions(true)}
              onChange={(e) => {
                onChange({ ...address, state: e.target.value });
                setShowStateSuggestions(true);
              }}
              className="rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-inner transition-all placeholder:text-charcoal/40 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          {showStateSuggestions && matchingStates.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gold/40 bg-white p-1.5 shadow-xl transition-all">
              <li className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Select State / Territory
              </li>
              {matchingStates.map((st) => (
                <li
                  key={st}
                  onClick={() => {
                    onChange({ ...address, state: st });
                    setShowStateSuggestions(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-navy hover:bg-gold/15 hover:text-gold-dark transition-colors"
                >
                  {st}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CITY INPUT WITH AUTOCOMPLETE (DEPENDS ON STATE) */}
        <div className="relative" ref={cityRef}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${prefix}-ct`} className="text-xs font-bold uppercase tracking-wider text-charcoal/80 flex items-center justify-between">
              <span>City <span className="text-red-500">*</span></span>
              {exactStateMatch && (
                <span className="text-[10px] font-bold text-emerald-600 lowercase bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  Showing {exactStateMatch} cities
                </span>
              )}
            </label>
            <input
              id={`${prefix}-ct`}
              type="text"
              required
              autoComplete="address-level2"
              placeholder={exactStateMatch ? `e.g. ${INDIAN_STATES_AND_CITIES[exactStateMatch][0]}` : "e.g. Lucknow"}
              value={address.city}
              onFocus={() => setShowCitySuggestions(true)}
              onChange={(e) => {
                onChange({ ...address, city: e.target.value });
                setShowCitySuggestions(true);
              }}
              className="rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-inner transition-all placeholder:text-charcoal/40 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          {showCitySuggestions && matchingCities.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gold/40 bg-white p-1.5 shadow-xl transition-all">
              <li className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                {exactStateMatch ? `Cities in ${exactStateMatch}` : "Matching Cities"}
              </li>
              {matchingCities.map((ct) => (
                <li
                  key={ct}
                  onClick={() => {
                    onChange({ ...address, city: ct });
                    setShowCitySuggestions(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-navy hover:bg-gold/15 hover:text-gold-dark transition-colors"
                >
                  {ct}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 6. PIN CODE (on left) and COUNTRY (on right) */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          id={`${prefix}-pc`}
          label="PIN code"
          required
          placeholder="e.g. 226029"
          value={address.postcode}
          onChange={(e) => onChange({ ...address, postcode: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefix}-co`} className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            id={`${prefix}-co`}
            type="text"
            required
            value={address.country}
            onChange={(e) => onChange({ ...address, country: e.target.value })}
            placeholder="IN"
            className="rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-inner transition-all placeholder:text-charcoal/40 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>
    </div>
  );
}
