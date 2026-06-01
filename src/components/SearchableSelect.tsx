import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
  error?: string;
  required?: boolean;
}

export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Outfit, sans-serif',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {label} {required && <span style={{ color: '#F87171' }}>*</span>}
        </span>
      </label>

      <div style={{ position: 'relative' }}>
        {/* Trigger Button */}
        <button
          id={id}
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setSearch('');
          }}
          style={{
            width: '100%',
            padding: '12px 40px 12px 14px',
            borderRadius: '10px',
            background: error ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${isOpen ? '#F5A623' : error ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: error ? '0 0 0 3px rgba(248, 113, 113, 0.25)' : 'none',
            color: value ? 'white' : 'rgba(255,255,255,0.4)',
            fontSize: '0.92rem',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'left',
            outline: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
              color: 'rgba(255,255,255,0.4)',
              transition: 'transform 0.2s',
              pointerEvents: 'none',
            }}
          />
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: '#0F2347',
              border: '1.5px solid rgba(245,166,35,0.4)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Search Input Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  color: 'rgba(255,255,255,0.4)',
                }}
              />
              <input
                type="text"
                placeholder="Search option..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                onKeyDown={e => {
                  if (e.key === 'Escape') setIsOpen(false);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Options List */}
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingRight: '2px',
              }}
              className="custom-scrollbar"
            >
              {filtered.length > 0 ? (
                filtered.map(opt => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(245,166,35,0.15)' : 'transparent',
                        color: isSelected ? '#F5A623' : 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.88rem',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: '12px 8px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '0.78rem', color: '#F87171', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
