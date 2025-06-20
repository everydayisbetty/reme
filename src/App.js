import React, { useState, useEffect, useCallback, useRef } from 'react';

// 艾宾浩斯记忆曲线间隔（分钟）
const INTERVALS = [1, 5, 30, 720, 1440, 4320, 10080, 25200];

// 颜色分类系统 - 极简版
const CATEGORIES = {
  red: { color: '#FF453A', name: 'Urgent', bgColor: '#2C1A1A' },
  yellow: { color: '#FFD60A', name: 'Important', bgColor: '#2C2A1A' },
  blue: { color: '#0A84FF', name: 'Deep', bgColor: '#1A232C' },
  gray: { color: '#8E8E93', name: 'Regular', bgColor: '#1E1E1E' }
};

// 可用的筛选条件类型 - Notion 风格
const FILTER_TYPES = [
  {
    id: 'status',
    name: '状态',
    type: 'select',
    options: [
      { value: 'needReview', label: '待复习' },
      { value: 'completed', label: '已完成今日' },
      { value: 'mastered', label: '已掌握' }
    ]
  },
  {
    id: 'category',
    name: '分类',
    type: 'select',
    options: [
      { value: 'red', label: 'Urgent' },
      { value: 'yellow', label: 'Important' },
      { value: 'blue', label: 'Deep' },
      { value: 'gray', label: 'Regular' }
    ]
  },
  {
    id: 'stage',
    name: '复习阶段',
    type: 'number',
    options: [
      { value: '0-2', label: '初学阶段 (0-2)' },
      { value: '3-4', label: '学习阶段 (3-4)' },
      { value: '5+', label: '掌握阶段 (5+)' }
    ]
  }
];

// SF Symbol 风格图标组件
const SFIcon = ({ name, size = 16, className = '' }) => {
  const sfIcons = {
    'magnifyingglass': '🔍',
    'line.horizontal.3.decrease.circle': '⚙️',
    'plus.circle.fill': '+',
    'rectangle.grid.2x2': '⊞',
    'list.bullet': '≡',
    'pencil': '✍️',
    'trash': '🗑️',
    'xmark': '✕',
    'checkmark': '✓',
    'arrow.clockwise': '🔄',
    'chevron.down': '⌄'
  };
  
  return (
    <span 
      className={`sf-icon ${className}`}
      style={{ 
        fontSize: `${size}px`, 
        lineHeight: 1, 
        display: 'inline-block',
        fontWeight: '400'
      }}
    >
      {sfIcons[name] || '?'}
    </span>
  );
};

// Notion 风格的筛选条件组件
const FilterCondition = ({ filter, onUpdate, onRemove }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValueSelect = (value) => {
    const option = filter.options.find(opt => opt.value === value);
    onUpdate({
      ...filter,
      value: value,
      displayValue: option?.label || value
    });
    setDropdownOpen(false);
  };

  const getDisplayValue = () => {
    if (!filter.value) return '选择值';
    const option = filter.options.find(opt => opt.value === filter.value);
    return option?.label || filter.value;
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#FFFFFF',
        gap: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        height: '32px',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ 
        color: 'rgba(255,255,255,0.8)',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center'
      }}>
        {filter.name}
      </span>
      
      <span style={{ 
        color: 'rgba(255,255,255,0.6)',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center'
      }}>
        是
      </span>
      
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          background: filter.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          color: filter.value ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          lineHeight: '1',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          height: '24px',
          minWidth: '80px'
        }}
      >
        {getDisplayValue()}
      </button>

      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          fontSize: '12px',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          flexShrink: 0
        }}
      >
        <SFIcon name="xmark" size={10} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          marginTop: '4px',
          minWidth: '120px',
          maxHeight: '200px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            overflowY: 'auto',
            maxHeight: '200px',
            padding: '4px'
          }}>
            {filter.options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleValueSelect(option.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  lineHeight: '20px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: filter.value === option.value ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Notion 风格的添加筛选按钮组件
const AddFilterButton = ({ 
  activeFilters, 
  setActiveFilters, 
  customAttributes 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAvailableFilters = () => {
    const allFilters = [...FILTER_TYPES];
    
    customAttributes.forEach(attr => {
      allFilters.push({
        id: `custom_${attr.name}`,
        name: attr.name,
        type: 'custom',
        options: attr.options
      });
    });

    return allFilters.filter(filter => 
      !activeFilters.some(active => active.type === filter.id)
    );
  };

  const availableFilters = getAvailableFilters();

  const handleAddFilter = (filterType) => {
    const newFilter = {
      id: Date.now(),
      type: filterType.id,
      name: filterType.name,
      operator: '=',
      value: null,
      options: filterType.options
    };

    setActiveFilters([...activeFilters, newFilter]);
    setIsOpen(false);
  };

  if (availableFilters.length === 0) return null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: '32px',
          padding: '0 14px',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.3)',
          fontSize: '13px',
          fontWeight: '500',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          background: 'transparent',
          color: 'rgba(255,255,255,0.7)',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          lineHeight: '1',
          boxSizing: 'border-box'
        }}
      >
        <SFIcon name="plus.circle.fill" size={12} />
        添加筛选
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          marginTop: '4px',
          minWidth: '200px',
          maxHeight: '240px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            overflowY: 'auto',
            maxHeight: '240px',
            padding: '4px'
          }}>
            {availableFilters.map((filter) => (
              <div
                key={filter.id}
                onClick={() => handleAddFilter(filter)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  lineHeight: '20px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: 'transparent',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span>{filter.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 统一的输入框样式
const inputBaseStyle = {
  background: '#1C1C1E',
  border: '1px solid #2C2C2E',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#FFFFFF',
  fontSize: '15px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  lineHeight: '1.5',
  transition: 'all 150ms ease',
  outline: 'none'
};

// Notion 风格的 PropertySelect 组件
const PropertySelect = ({ 
  options = [], 
  selected, 
  onChange, 
  allowCreate = true, 
  multi = false,
  placeholder = "选择属性",
  onCreateOption = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option => 
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = allowCreate && 
    searchTerm.trim() && 
    !filteredOptions.some(opt => opt.value.toLowerCase() === searchTerm.toLowerCase());

  const handleSelect = useCallback((option) => {
    if (multi) {
      const newSelected = Array.isArray(selected) ? selected : [];
      const exists = newSelected.find(s => s.value === option.value);
      
      if (exists) {
        onChange(newSelected.filter(s => s.value !== option.value));
      } else {
        onChange([...newSelected, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
    setFocusedIndex(-1);
  }, [multi, selected, onChange]);

  const handleCreateNew = useCallback(() => {
    if (!searchTerm.trim()) return;
    
    const newOption = {
      value: searchTerm.trim(),
      color: '#0A84FF'
    };

    if (onCreateOption) {
      onCreateOption(newOption);
    }
    
    handleSelect(newOption);
    setSearchTerm('');
  }, [searchTerm, onCreateOption, handleSelect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multi ? [] : null);
  };

  const getDisplayText = () => {
    if (multi) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      if (selectedArray.length === 0) return placeholder;
      if (selectedArray.length === 1) return selectedArray[0].value;
      return `${selectedArray.length} 项已选`;
    } else {
      return selected?.value || placeholder;
    }
  };

  const hasSelection = () => {
    if (multi) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      return selectedArray.length > 0;
    } else {
      return selected && selected.value;
    }
  };

  const isSelected = (option) => {
    if (multi) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      return selectedArray.some(s => s.value === option.value);
    } else {
      return selected?.value === option.value;
    }
  };

  return (
    <div className="property-select" ref={containerRef} style={{ position: 'relative' }}>
      <div 
        className={`property-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        style={{
          height: '32px',
          borderRadius: '4px',
          border: '1px solid #2C2C2E',
          background: '#1C1C1E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <span style={{ 
          color: hasSelection() ? '#FFFFFF' : '#8E8E93',
          flex: 1,
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {getDisplayText()}
        </span>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0
        }}>
          {hasSelection() && (
            <button 
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: '#8E8E93',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '2px',
                transition: 'color 150ms ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <SFIcon name="xmark" size={12} />
            </button>
          )}
          <span style={{
            color: '#8E8E93',
            transition: 'transform 150ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '12px'
          }}>
            <SFIcon name="chevron.down" size={12} />
          </span>
        </div>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1C1C1E',
            border: '1px solid #2C2C2E',
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            marginTop: '2px',
            maxHeight: '240px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #2C2C2E'
          }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索或输入新选项..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '28px',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${searchTerm ? '#0A84FF' : '#3A3A3C'}`,
                padding: '4px 0',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 150ms ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
            />
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '180px'
          }}>
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '15px',
                  fontWeight: '400',
                  lineHeight: '24px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: (focusedIndex === index || isSelected(option)) ? '#2C2C2E' : 'transparent',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    flexShrink: 0
                  }} />
                  <span style={{
                    flex: 1,
                    color: '#FFFFFF'
                  }}>
                    {option.value}
                  </span>
                </div>
                {isSelected(option) && (
                  <span style={{
                    color: '#0A84FF',
                    fontSize: '14px'
                  }}>
                    <SFIcon name="checkmark" size={14} />
                  </span>
                )}
              </div>
            ))}

            {showCreateOption && (
              <div
                onClick={handleCreateNew}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '15px',
                  fontWeight: '400',
                  lineHeight: '24px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: focusedIndex === filteredOptions.length ? '#2C2C2E' : 'transparent',
                  color: '#0A84FF',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#0A84FF',
                    flexShrink: 0
                  }} />
                  <span>
                    创建新属性: '{searchTerm}'
                  </span>
                </div>
                <span style={{ fontSize: '14px' }}>+</span>
              </div>
            )}

            {filteredOptions.length === 0 && !showCreateOption && (
              <div style={{
                padding: '16px 12px',
                textAlign: 'center',
                color: '#8E8E93',
                fontSize: '14px'
              }}>
                未找到匹配项
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 自定义属性管理组件
const CustomAttributesManager = ({ 
  customAttributes, 
  setCustomAttributes, 
  cardAttributes, 
  setCardAttributes,
  saveCustomAttributes,
  showToast 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteAttribute = (attrId) => {
    if (window.confirm('确定要删除这个属性吗？')) {
      const updatedAttributes = customAttributes.filter(attr => attr.id !== attrId);
      saveCustomAttributes(updatedAttributes);
    }
  };

  const handleCreateOption = (attrId, newOption) => {
    const updatedAttributes = customAttributes.map(attr => {
      if (attr.id === attrId) {
        return {
          ...attr,
          options: [...attr.options, newOption]
        };
      }
      return attr;
    });
    saveCustomAttributes(updatedAttributes);
  };

  return (
    <>
      <div className="custom-attributes-manager">
        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label>自定义属性</label>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{
                background: '#0A84FF',
                border: 'none',
                borderRadius: '16px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms ease'
              }}
            >
              <SFIcon name="plus.circle.fill" size={12} />
              添加属性
            </button>
          </div>

          {customAttributes.map(attr => (
            <div key={attr.id} className="form-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label>{attr.name}</label>
                <button 
                  onClick={() => deleteAttribute(attr.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF453A',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  删除
                </button>
              </div>
              
              <PropertySelect
                options={attr.options}
                selected={cardAttributes[attr.name] ? 
                  attr.options.find(opt => opt.value === cardAttributes[attr.name]) : null}
                onChange={(selectedOption) => {
                  setCardAttributes({
                    ...cardAttributes,
                    [attr.name]: selectedOption?.value
                  });
                }}
                placeholder={`选择${attr.name}`}
                allowCreate={true}
                onCreateOption={(newOption) => handleCreateOption(attr.id, newOption)}
              />
            </div>
          ))}
        </div>
      </div>

      <AttributeCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customAttributes={customAttributes}
        saveCustomAttributes={saveCustomAttributes}
        showToast={showToast}
      />
    </>
  );
};

// 属性创建模态组件
const AttributeCreationModal = ({ 
  isOpen, 
  onClose, 
  customAttributes, 
  saveCustomAttributes,
  showToast 
}) => {
  const [step, setStep] = useState(1);
  const [attributeName, setAttributeName] = useState('');
  const [options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0A84FF');

  const resetModal = () => {
    setStep(1);
    setAttributeName('');
    setOptions([]);
    setCurrentOption('');
    setSelectedColor('#0A84FF');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleNext = () => {
    if (attributeName.trim()) {
      setStep(2);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 1 && attributeName.trim()) {
        handleNext();
      } else if (step === 2 && currentOption.trim()) {
        addOption();
      }
    }
  };

  const addOption = () => {
    if (currentOption.trim() && !options.some(opt => opt.value === currentOption.trim())) {
      setOptions([...options, { value: currentOption.trim(), color: selectedColor }]);
      setCurrentOption('');
    }
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (attributeName.trim() && options.length > 0) {
      const newAttribute = {
        id: Date.now(),
        name: attributeName.trim(),
        options: options
      };
      saveCustomAttributes([...customAttributes, newAttribute]);
      handleClose();
      showToast && showToast(`属性 "${attributeName}" 创建成功！`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        background: '#1C1C1E',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
        width: '400px',
        padding: '40px',
        border: '1px solid #2C2C2E'
      }}>
        {step === 1 ? (
          <>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#FFFFFF',
              margin: '0 0 32px 0',
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
            }}>创建新属性</h2>

            <div style={{ marginBottom: '40px' }}>
              <input
                type="text"
                placeholder="请输入属性名称"
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 20px',
                  borderRadius: '24px',
                  border: 'none',
                  background: '#2C2C2E',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  outline: 'none',
                  transition: 'all 200ms ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8E8E93',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  cursor: 'pointer',
                  padding: '0',
                  transition: 'opacity 150ms ease',
                  display: 'flex',        // 添加这行
                  alignItems: 'center',   // 添加这行
                  gap: '6px'              // 添加这行，控制图标和文字间距
                }}
              >
                <SFIcon name="xmark" size={14} />
                取消
              </button>

              <button
                onClick={handleNext}
                disabled={!attributeName.trim()}
                style={{
                  width: '90px',
                  height: '32px',
                  borderRadius: '24px',
                  border: 'none',
                  background: attributeName.trim() ? '#0A84FF' : '#2C2C2E',
                  color: attributeName.trim() ? '#FFFFFF' : '#8E8E93',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  cursor: attributeName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                下一步
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>{attributeName}</h2>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                background: '#2C2C2E',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '120px'
              }}>
                {options.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {options.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: option.color,
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: '600',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                        }}
                      >
                        {option.value}
                        <button
                          onClick={() => removeOption(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '0',
                            marginLeft: '4px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="输入选项名称，回车添加"
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3A3A3C',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', 
                width: '100%'
              }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8E8E93',
                    fontSize: '16px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  返回
                </button>
                <button
                  onClick={handleComplete}
                  disabled={options.length === 0}
                  style={{
                    width: '90px',
                    height: '32px',
                    borderRadius: '24px',
                    border: 'none',
                    background: options.length > 0 ? '#32D74B' : '#2C2C2E',
                    color: options.length > 0 ? '#FFFFFF' : '#8E8E93',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    cursor: options.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 150ms ease', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  完成
                </button>
              </div>
          </>
        )}
      </div>
    </div>
  );
};

const GlassProgressRing = ({ stage, totalStages }) => {
  const progress = (stage + 1) / totalStages;
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (progress * circumference);
  
  return (
    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
      <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="#555555"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="#0A84FF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '20px',
        fontWeight: '600',
        color: '#0A84FF',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {stage + 1}
      </div>
    </div>
  );
};

// Toast通知组件
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#32D74B' : '#FF453A',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {message}
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0',
          marginLeft: '8px'
        }}
      >
        ×
      </button>
    </div>
  );
};

// 卡片编辑器组件
const CardEditor = ({ 
  formData, 
  setFormData, 
  clozes, 
  setClozes, 
  onSave, 
  onCancel, 
  renderMarkdownWithCloze,
  generateAutoCloze,
  isEditing,
  customAttributes,
  setCustomAttributes,
  saveCustomAttributes,
  showToast
}) => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2C2C2E'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#FFFFFF',
          margin: 0
        }}>{isEditing ? '编辑卡片' : '创建新卡片'}</h2>
        <button 
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#8E8E93',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 150ms ease'
          }}
        >
          <SFIcon name="xmark" size={20} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="输入卡片标题..."
            style={inputBaseStyle}
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>内容</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="输入内容... 支持 **粗体** *斜体* ~~删除线~~ Markdown格式"
            rows={8}
            style={{
              ...inputBaseStyle,
              resize: 'vertical',
              minHeight: '120px'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>分类</label>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {Object.entries(CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setFormData({...formData, category: key})}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  border: '1px solid #2C2C2E',
                  borderRadius: '16px',
                  background: formData.category === key ? category.color : 'transparent',
                  borderColor: category.color,
                  color: formData.category === key ? 'white' : '#FFFFFF',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: category.color
                }} />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <CustomAttributesManager 
          customAttributes={customAttributes}
          setCustomAttributes={setCustomAttributes}
          cardAttributes={formData.customAttributes}
          setCardAttributes={(attrs) => setFormData({...formData, customAttributes: attrs})}
          saveCustomAttributes={saveCustomAttributes}
          showToast={showToast}
        />

        {formData.content && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#FFFFFF'
              }}>预览 (点击单词切换挖空)</label>
              <button 
                onClick={() => setClozes(generateAutoCloze(formData.content))}
                style={{
                  background: '#2C2C2E',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  color: '#0A84FF',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 150ms ease'
                }}
              >
                <SFIcon name="arrow.clockwise" size={12} />
                自动生成挖空
              </button>
            </div>
            <div style={{
              background: '#1C1C1E',
              border: '1px solid #2C2C2E',
              borderRadius: '16px',
              padding: '16px',
              minHeight: '120px',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              {renderMarkdownWithCloze(formData.content, clozes, true)}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>笔记</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="添加学习笔记..."
            rows={3}
            style={{
              ...inputBaseStyle,
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '1px solid #2C2C2E'
        }}>
          <button 
            onClick={onCancel}
            style={{
              background: '#2C2C2E',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 150ms ease'
            }}
          >
            取消
          </button>
          <button 
            onClick={onSave}
            disabled={!formData.title.trim() || !formData.content.trim()}
            style={{
              background: (!formData.title.trim() || !formData.content.trim()) ? '#2C2C2E' : '#0A84FF',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 12px',
              color: (!formData.title.trim() || !formData.content.trim()) ? '#8E8E93' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (!formData.title.trim() || !formData.content.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 150ms ease'
            }}
          >
            <SFIcon name="checkmark" size={14} />
            {isEditing ? '更新' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 卡片详情组件
const CardDetail = ({ 
  card, 
  onEdit, 
  onDelete, 
  onMarkReviewed, 
  renderMarkdownWithCloze,
  formatDate,
  isReviewTime,
  customAttributes
}) => {
  const nextReview = formatDate(card.nextReview);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2C2C2E'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <div style={{
            width: '4px',
            height: '24px',
            borderRadius: '2px',
            backgroundColor: CATEGORIES[card.category]?.color
          }} />
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#FFFFFF',
            margin: 0
          }}>{card.title}</h1>
          {card.customAttributes && Object.keys(card.customAttributes).length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginLeft: '16px',
              alignItems: 'center'
            }}>
              {Object.entries(card.customAttributes).map(([attrName, value]) => {
                const attr = customAttributes.find(a => a.name === attrName);
                const option = attr?.options.find(o => o.value === value);
                
                return (
                  <span 
                    key={attrName}
                    style={{
                      backgroundColor: option?.color || '#8E8E93',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button 
            onClick={onEdit}
            style={{
              background: '#2C2C2E',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#8E8E93',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <SFIcon name="pencil" size={16} />
          </button>
          <button 
            onClick={onDelete}
            style={{
              background: '#2C2C2E',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#8E8E93',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <SFIcon name="trash" size={16} />
          </button>
        </div>
      </div>

      <div style={{
        background: '#1C1C1E',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        minHeight: '120px',
        fontSize: '18px',
        lineHeight: '1.6'
      }}>
        {renderMarkdownWithCloze(card.content, new Set(card.clozes || []), false, isReviewTime)}
      </div>

      {card.notes && (
        <div style={{ 
          background: '#1C1C1E', 
          borderRadius: '12px', 
          padding: '16px', 
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            color: '#8E8E93', 
            margin: '0 0 8px 0' 
          }}>学习笔记</h3>
          <p style={{ 
            margin: '0', 
            fontSize: '14px', 
            lineHeight: '1.5' 
          }}>{card.notes}</p>
        </div>
      )}

      <div style={{
        background: '#1C1C1E',
        borderRadius: '12px',
        padding: '16px 24px 24px 24px',
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '17px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>
            Next: {nextReview.text} · Stage {card.stage + 1} / {INTERVALS.length}
          </div>
          <GlassProgressRing stage={card.stage} totalStages={INTERVALS.length} />
        </div>
        
        {isReviewTime && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <button 
              onClick={() => onMarkReviewed(false)}
              style={{
                height: '48px',
                border: 'none',
                borderRadius: '24px',
                padding: '0 32px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#3A3A3C'
              }}
            >
              🔁 再练一次
            </button>
            <button 
              onClick={() => onMarkReviewed(true)}
              style={{
                height: '48px',
                border: 'none',
                borderRadius: '24px',
                padding: '0 32px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#32D74B'
              }}
            >
              ✅ 记住了
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 卡片列表组件
const CardsList = ({ cards, onSelectCard, selectedCard, searchTerm, formatDate, highlightText }) => {
  if (cards.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 40px',
        color: '#8E8E93'
      }}>
        <div style={{fontSize: '64px', marginBottom: '16px'}}>📚</div>
        <h2 style={{
          fontSize: '24px',
          color: '#FFFFFF',
          margin: '16px 0 8px 0'
        }}>暂无卡片</h2>
        <p>开始创建你的第一张记忆卡片吧！</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gridAutoRows: 'min-content'
    }}>
      {cards.map((card) => {
        const nextReview = formatDate(card.nextReview);
        const progress = Math.min((card.stage / (INTERVALS.length - 1)) * 100, 100);
        
        return (
          <div
            key={card.id}
            onClick={() => onSelectCard(card)}
            style={{
              background: '#1C1C1E',
              border: selectedCard?.id === card.id ? '1px solid #0A84FF' : '1px solid #2C2C2E',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: CATEGORIES[card.category]?.color
              }} />
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0
              }}>{highlightText(card.title, searchTerm)}</h3>
            </div>
            
            <div>
              <p style={{
                fontSize: '14px',
                color: '#8E8E93',
                lineHeight: '1.4',
                margin: '0 0 16px 0'
              }}>{highlightText(card.content.replace(/[*~_`]/g, '').substring(0, 100), searchTerm)}...</p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                fontSize: '12px'
              }}>
                <span style={{
                  color: nextReview.urgent ? '#FF453A' : '#8E8E93',
                  fontWeight: nextReview.urgent ? '600' : 'normal'
                }}>
                  {nextReview.text}
                </span>
                <span style={{
                  color: '#0A84FF'
                }}>阶段 {card.stage + 1}</span>
              </div>
              
              <div style={{
                width: '60px',
                height: '4px',
                background: '#2C2C2E',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#0A84FF',
                  transition: 'width 300ms ease',
                  width: `${progress}%`
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 主应用组件
function App() {
  // 核心状态
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [revealedClozes, setRevealedClozes] = useState(new Set());
  
  // 自定义属性管理
  const [customAttributes, setCustomAttributes] = useState([]);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'gray',
    customAttributes: {},
    notes: ''
  });
  const [clozes, setClozes] = useState(new Set());
  
  // 视图状态
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy] = useState('nextReview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 显示Toast通知
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // 数据持久化
  const saveCards = useCallback((cardsData) => {
    try {
      // 使用内存存储
    } catch (error) {
      showToast('保存失败: ' + error.message, 'error');
    }
  }, []);

  const saveCustomAttributes = useCallback((attributes) => {
    try {
      setCustomAttributes(attributes);
    } catch (error) {
      showToast('保存属性失败: ' + error.message, 'error');
    }
  }, []);

  const loadCustomAttributes = useCallback(() => {
    try {
      const defaultAttributes = [];
      setCustomAttributes(defaultAttributes);
    } catch (error) {
      console.error('加载自定义属性失败:', error);
    }
  }, []);

  const loadCards = useCallback(() => {
    const createSampleCards = () => {
      const sampleCards = [
        {
          id: Date.now(),
          title: '勇气的定义',
          content: '**Courage** is not the absence of *fear*, but the ~~triumph~~ over it. The brave may not live forever, but the cautious do not live at all.',
          category: 'blue',
          customAttributes: {},
          clozes: ['Courage', 'fear', 'triumph', 'brave', 'cautious'],
          createdAt: new Date(),
          nextReview: new Date(Date.now() + INTERVALS[0] * 60000),
          stage: 0,
          notes: '',
          reviewCount: 0,
          errorCount: 0
        },
        {
          id: Date.now() + 1,
          title: 'JavaScript 闭包',
          content: '**闭包**是指有权访问另一个函数作用域内变量的*函数*。创建闭包的常见方式就是在一个函数内部创建另一个函数。',
          category: 'red',
          customAttributes: {},
          clozes: ['闭包', '函数', '作用域', '变量'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextReview: new Date(Date.now() - 10 * 60000),
          stage: 2,
          notes: '重要的编程概念',
          reviewCount: 3,
          errorCount: 1
        },
        {
          id: Date.now() + 2,
          title: '设计原则',
          content: '*简约*不是缺少什么，而是删除了多余的东西。好的设计是**尽可能少的设计**。',
          category: 'yellow',
          customAttributes: {},
          clozes: ['简约', '设计', '多余'],
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000),
          stage: 5,
          notes: '乔布斯的设计哲学',
          reviewCount: 8,
          errorCount: 0
        },
        {
          id: Date.now() + 3,
          title: '学习方法',
          content: '~~死记硬背~~不如理解原理。最好的学习方法是**主动思考**和*实践应用*。',
          category: 'gray',
          customAttributes: {},
          clozes: ['死记硬背', '理解', '主动思考', '实践应用'],
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          nextReview: new Date(Date.now() + 6 * 60 * 60 * 1000),
          stage: 3,
          notes: '学习心得',
          reviewCount: 5,
          errorCount: 2
        }
      ];
      
      setCards(sampleCards);
      saveCards(sampleCards);
      showToast('已创建示例卡片');
    };

    try {
      createSampleCards();
    } catch (error) {
      console.error('加载失败:', error);
      createSampleCards();
    }
  }, [saveCards]);

  // 标记复习状态
  const markReviewed = useCallback((correct = true) => {
    if (!currentCard) return;

    const updatedCard = { ...currentCard };
    updatedCard.reviewCount += 1;
    
    if (!correct) {
      updatedCard.errorCount += 1;
      updatedCard.stage = Math.max(0, updatedCard.stage - 1);
    } else {
      updatedCard.stage = Math.min(INTERVALS.length - 1, updatedCard.stage + 1);
    }
    
    updatedCard.nextReview = new Date(Date.now() + INTERVALS[updatedCard.stage] * 60000);
    
    const newCards = cards.map(card => 
      card.id === currentCard.id ? updatedCard : card
    );
    
    setCards(newCards);
    saveCards(newCards);
    
    showToast(correct ? '复习完成！' : '已标记错误，稍后再复习');
    
    setRevealedClozes(new Set());
    
    const needReview = newCards.filter(card => 
      card.nextReview <= new Date() && card.id !== currentCard.id
    );
    
    if (needReview.length > 0) {
      setCurrentCard(needReview[0]);
    } else {
      setCurrentCard(null);
    }
  }, [currentCard, cards, saveCards]);

  // 初始化数据
  useEffect(() => {
    loadCards();
    loadCustomAttributes();
  }, [loadCards, loadCustomAttributes]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (currentCard && !isCreating && !isEditing) {
        if (e.code === 'Space') {
          e.preventDefault();
          markReviewed(false);
        } else if (e.code === 'Enter') {
          e.preventDefault();
          markReviewed(true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, isCreating, isEditing, markReviewed]);

  // 统一的筛选逻辑
  const getFilteredAndSortedCards = useCallback(() => {
    let filtered = cards;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(term) ||
        card.content.toLowerCase().includes(term) ||
        card.notes.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }

    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'status':
          const now = new Date();
          switch (filter.value) {
            case 'needReview':
              filtered = filtered.filter(card => card.nextReview <= now);
              break;
            case 'completed':
              filtered = filtered.filter(card => card.nextReview > now);
              break;
            case 'mastered':
              filtered = filtered.filter(card => card.stage >= 5);
              break;
            default:
              break;
          }
          break;
        case 'category':
          if (filter.value) {
            filtered = filtered.filter(card => card.category === filter.value);
          }
          break;
        case 'stage':
          if (filter.value) {
            switch (filter.value) {
              case '0-2':
                filtered = filtered.filter(card => card.stage >= 0 && card.stage <= 2);
                break;
              case '3-4':
                filtered = filtered.filter(card => card.stage >= 3 && card.stage <= 4);
                break;
              case '5+':
                filtered = filtered.filter(card => card.stage >= 5);
                break;
              default:
                break;
            }
          }
          break;
        default:
          if (filter.type.startsWith('custom_') && filter.value) {
            const attrName = filter.type.replace('custom_', '');
            filtered = filtered.filter(card => 
              card.customAttributes && card.customAttributes[attrName] === filter.value
            );
          }
          break;
      }
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nextReview':
          return a.nextReview - b.nextReview;
        case 'createdAt':
          return b.createdAt - a.createdAt;
        case 'stage':
          return b.stage - a.stage;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cards, searchTerm, selectedCategory, activeFilters, sortBy]);

  // 卡片操作
  const createCard = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('请填写标题和内容', 'error');
      return;
    }

    const newCard = {
      id: Date.now(),
      title: formData.title.trim(),
      content: formData.content,
      category: formData.category,
      customAttributes: formData.customAttributes,
      clozes: Array.from(clozes),
      createdAt: new Date(),
      nextReview: new Date(Date.now() + INTERVALS[0] * 60000),
      stage: 0,
      notes: formData.notes,
      reviewCount: 0,
      errorCount: 0
    };

    const newCards = [...cards, newCard];
    setCards(newCards);
    saveCards(newCards);
    
    resetForm();
    setIsCreating(false);
    showToast('卡片创建成功！');
  };

  const updateCard = () => {
    if (!currentCard) return;

    const updatedCard = {
      ...currentCard,
      title: formData.title.trim(),
      content: formData.content,
      category: formData.category,
      customAttributes: formData.customAttributes,
      clozes: Array.from(clozes),
      notes: formData.notes
    };

    const newCards = cards.map(card => 
      card.id === currentCard.id ? updatedCard : card
    );
    
    setCards(newCards);
    saveCards(newCards);
    setCurrentCard(updatedCard);
    setIsEditing(false);
    showToast('卡片更新成功！');
  };

  const deleteCard = (cardId) => {
    if (window.confirm('确定要删除这张卡片吗？')) {
      const newCards = cards.filter(card => card.id !== cardId);
      setCards(newCards);
      saveCards(newCards);
      
      if (currentCard?.id === cardId) {
        setCurrentCard(null);
      }
      
      showToast('卡片已删除');
    }
  };

  // 表单处理
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'gray',
      customAttributes: {},
      notes: ''
    });
    setClozes(new Set());
  };

  const startCreating = () => {
    resetForm();
    setFormData({
      title: '',
      content: '**Example**: This is a *sample* content with ~~strikethrough~~ text.',
      category: 'gray',
      customAttributes: {},
      notes: ''
    });
    setClozes(generateAutoCloze('**Example**: This is a *sample* content with ~~strikethrough~~ text.'));
    setIsCreating(true);
    setCurrentCard(null);
  };

  const startEditing = () => {
    if (!currentCard) return;
    
    setFormData({
      title: currentCard.title,
      content: currentCard.content,
      category: currentCard.category,
      customAttributes: currentCard.customAttributes || {},
      notes: currentCard.notes || ''
    });
    setClozes(new Set(currentCard.clozes || []));
    setIsEditing(true);
  };

  // 处理统计面板点击
  const handleStatClick = (statType) => {
    setCurrentCard(null);
    
    const newFilters = activeFilters.filter(filter => filter.type !== 'status');
    
    switch (statType) {
      case 'needReview':
        newFilters.push({
          id: Date.now(),
          type: 'status',
          name: '状态',
          operator: '=',
          value: 'needReview',
          options: FILTER_TYPES.find(t => t.id === 'status').options
        });
        break;
      case 'mastered':
        newFilters.push({
          id: Date.now(),
          type: 'status',
          name: '状态',
          operator: '=',
          value: 'mastered',
          options: FILTER_TYPES.find(t => t.id === 'status').options
        });
        break;
      default:
        break;
    }
    
    setActiveFilters(newFilters);
    setSearchTerm('');
    setShowFilters(true);
  };

  // 精确的单词提取和挖空处理
  const extractExactWords = (text) => {
    const cleanText = text.replace(/[*~_`<>]/g, '');
    const wordRegex = /\b[A-Za-z0-9']+\b/g;
    const words = [];
    let match;
    
    while ((match = wordRegex.exec(cleanText)) !== null) {
      const word = match[0];
      if (word.length > 3) {
        words.push(word);
      }
    }
    
    return Array.from(new Set(words));
  };

  // 生成自动挖空
  const generateAutoCloze = (text) => {
    const words = extractExactWords(text);
    const count = Math.ceil(words.length * 0.3);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return new Set(shuffled.slice(0, count));
  };

  const toggleCloze = (clickedText) => {
    const cleanWord = clickedText.replace(/[^A-Za-z0-9']/g, '');
    
    if (!cleanWord || cleanWord.length <= 3) return;
    
    const newClozes = new Set(clozes);
    if (newClozes.has(cleanWord)) {
      newClozes.delete(cleanWord);
    } else {
      newClozes.add(cleanWord);
    }
    setClozes(newClozes);
  };

  const toggleRevealCloze = (clickedText) => {
    const cleanWord = clickedText.replace(/[^A-Za-z0-9']/g, '');
    if (!cleanWord) return;
    
    const newRevealed = new Set(revealedClozes);
    if (newRevealed.has(cleanWord)) {
      newRevealed.delete(cleanWord);
    } else {
      newRevealed.add(cleanWord);
    }
    setRevealedClozes(newRevealed);
  };

  // Markdown渲染器
  const renderMarkdownWithCloze = (text, clozeSet, isEditable = false, isReview = false) => {
    if (!text) return null;

    const parseMarkdown = (input) => {
      const elements = [];
      let remainingText = input;
      let keyCounter = 0;

      while (remainingText.length > 0) {
        const boldMatch = remainingText.match(/\*\*(.*?)\*\*/);
        const italicMatch = remainingText.match(/\*(.*?)\*/);
        const strikeMatch = remainingText.match(/~~(.*?)~~/);

        let nextMatch = null;
        let matchType = '';
        let matchIndex = remainingText.length;

        if (boldMatch && boldMatch.index < matchIndex) {
          nextMatch = boldMatch;
          matchType = 'bold';
          matchIndex = boldMatch.index;
        }
        if (italicMatch && italicMatch.index < matchIndex && 
            (!boldMatch || italicMatch.index !== boldMatch.index)) {
          nextMatch = italicMatch;
          matchType = 'italic';
          matchIndex = italicMatch.index;
        }
        if (strikeMatch && strikeMatch.index < matchIndex) {
          nextMatch = strikeMatch;
          matchType = 'strike';
          matchIndex = strikeMatch.index;
        }

        if (nextMatch) {
          if (matchIndex > 0) {
            const beforeText = remainingText.substring(0, matchIndex);
            elements.push(...processTextForCloze(beforeText, clozeSet, isEditable, isReview, keyCounter));
            keyCounter += beforeText.split(/\b[A-Za-z0-9']+\b/).length;
          }

          const content = nextMatch[1];
          let styledElement;
          
          switch (matchType) {
            case 'bold':
              styledElement = React.createElement('strong', { key: keyCounter++ }, 
                ...processTextForCloze(content, clozeSet, isEditable, isReview, keyCounter));
              break;
            case 'italic':
              styledElement = React.createElement('em', { key: keyCounter++ }, 
                ...processTextForCloze(content, clozeSet, isEditable, isReview, keyCounter));
              break;
            case 'strike':
              styledElement = React.createElement('del', { key: keyCounter++ }, 
                ...processTextForCloze(content, clozeSet, isEditable, isReview, keyCounter));
              break;
            default:
              styledElement = content;
          }
          
          elements.push(styledElement);
          keyCounter += content.split(/\b[A-Za-z0-9']+\b/).length;

          remainingText = remainingText.substring(matchIndex + nextMatch[0].length);
        } else {
          elements.push(...processTextForCloze(remainingText, clozeSet, isEditable, isReview, keyCounter));
          remainingText = '';
        }
      }

      return elements;
    };

    const processTextForCloze = (text, clozeSet, isEditable, isReview, keyOffset = 0) => {
      const parts = text.split(/(\b[A-Za-z0-9']+\b)/);
      
      return parts.map((part, index) => {
        const key = keyOffset + index;
        
        if (/^[A-Za-z0-9']+$/.test(part)) {
          const isHidden = clozeSet.has(part);
          const isRevealed = revealedClozes.has(part);
          
          let className = 'word';
          if (isEditable) className += ' editable';
          if (isHidden && !isRevealed) className += ' cloze';
          if (isHidden && isRevealed) className += ' cloze revealed';

          const handleClick = () => {
            if (isEditable) {
              toggleCloze(part);
            } else if (isReview && isHidden) {
              toggleRevealCloze(part);
            }
          };

          const handleMouseEnter = (e) => {
            if (isEditable && !isHidden) {
              e.target.style.background = 'rgba(10, 132, 255, 0.3)';
              e.target.style.borderRadius = '4px';
            }
          };

          const handleMouseLeave = (e) => {
            if (isEditable && !isHidden) {
              e.target.style.background = 'transparent';
            }
          };

          return React.createElement('span', {
            key: key,
            className: className,
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            style: {
              ...(isHidden && !isRevealed && {
                background: 'rgba(160, 160, 160, 0.5)',
                color: 'transparent',
                borderRadius: '4px',
                padding: '2px 4px',
                margin: '0 1px',
                cursor: isReview ? 'pointer' : 'default',
                userSelect: 'none'
              }),
              ...(isEditable && !isHidden && {
                cursor: 'pointer'
              })
            }
          }, part);
        } else {
          return part;
        }
      });
    };

    return React.createElement('div', {}, ...parseMarkdown(text));
  };

  // 统计数据
  const stats = {
    total: cards.length,
    needReview: cards.filter(card => card.nextReview <= new Date()).length,
    mastered: cards.filter(card => card.stage >= 5).length,
    byCategory: Object.keys(CATEGORIES).reduce((acc, cat) => {
      acc[cat] = cards.filter(card => card.category === cat).length;
      return acc;
    }, {})
  };

  const filteredCards = getFilteredAndSortedCards();

  // 格式化时间
  const formatDate = (date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diff < 0) return { text: '需要复习', urgent: true };
    if (minutes < 60) return { text: `${minutes}m`, urgent: false };
    if (hours < 24) return { text: `${hours}h`, urgent: false };
    const days = Math.floor(hours / 24);
    return { text: `${days}d`, urgent: false };
  };

  // 高亮搜索文本
  const highlightText = (text, search) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return React.createElement('span', {},
      ...parts.map((part, index) => 
        regex.test(part) ? 
          React.createElement('mark', { key: index }, part) : 
          part
      )
    );
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif',
      color: '#FFFFFF'
    }}>
      {/* Toast通知 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* 侧边栏 */}
      <div style={{
        width: sidebarCollapsed ? '60px' : '280px',
        background: '#1C1C1E',
        borderRight: '1px solid #2C2C2E',
        padding: sidebarCollapsed ? '24px 16px' : '24px',
        transition: 'width 150ms ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#0A84FF'
          }}>
            {!sidebarCollapsed && <span>Romem</span>}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8E8E93',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 150ms ease'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* 统计面板 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div onClick={() => handleStatClick('all')} style={{
                textAlign: 'center',
                padding: '16px',
                background: '#2C2C2E',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}>
                <span style={{
                  display: 'block',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#FFFFFF'
                }}>{stats.total}</span>
                <span style={{
                  fontSize: '12px',
                  color: '#8E8E93',
                  marginTop: '4px'
                }}>总卡片</span>
              </div>
              <div onClick={() => handleStatClick('needReview')} style={{
                textAlign: 'center',
                padding: '16px',
                background: '#2C2C2E',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}>
                <span style={{
                  display: 'block',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#FF453A'
                }}>{stats.needReview}</span>
                <span style={{
                  fontSize: '12px',
                  color: '#8E8E93',
                  marginTop: '4px'
                }}>待复习</span>
              </div>
              <div onClick={() => handleStatClick('mastered')} style={{
                textAlign: 'center',
                padding: '16px',
                background: '#2C2C2E',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}>
                <span style={{
                  display: 'block',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#32D74B'
                }}>{stats.mastered}</span>
                <span style={{
                  fontSize: '12px',
                  color: '#8E8E93',
                  marginTop: '4px'
                }}>已掌握</span>
              </div>
            </div>

            {/* 分类筛选 */}
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#8E8E93',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>分类</h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    cursor: 'pointer',
                    transition: 'all 100ms ease',
                    background: selectedCategory === 'all' ? '#0A84FF' : '#2C2C2E',
                    color: selectedCategory === 'all' ? '#FFFFFF' : '#8E8E93',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    whiteSpace: 'nowrap',
                    userSelect: 'none'
                  }}
                >
                  <span>全部分类</span>
                  <span style={{
                    fontSize: '12px',
                    color: selectedCategory === 'all' ? '#FFFFFF' : '#8E8E93',
                    background: selectedCategory === 'all' ? 'rgba(255,255,255,0.2)' : '#3A3A3C',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {stats.total}
                  </span>
                </button>

                {Object.entries(CATEGORIES).map(([key, category]) => (
                  stats.byCategory[key] > 0 && (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        cursor: 'pointer',
                        transition: 'all 100ms ease',
                        background: selectedCategory === key ? category.color : '#2C2C2E',
                        color: selectedCategory === key ? '#FFFFFF' : '#8E8E93',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: selectedCategory === key ? '#FFFFFF' : category.color,
                          flexShrink: 0
                        }} />
                        <span>{category.name}</span>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: selectedCategory === key ? '#FFFFFF' : '#8E8E93',
                        background: selectedCategory === key ? 'rgba(255,255,255,0.2)' : '#3A3A3C',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        {stats.byCategory[key]}
                      </span>
                    </button>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#000000'
      }}>
        {/* 顶部工具栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#1C1C1E',
          borderBottom: '1px solid #2C2C2E'
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            maxWidth: '400px'
          }}>
            <input
              type="text"
              placeholder="Search cards…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                border: 'none',
                borderRadius: '18px',
                background: '#2C2C2E',
                color: '#FFFFFF',
                fontSize: '15px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                outline: 'none',
                transition: 'background 150ms ease'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '16px',
            flexShrink: 0
          }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              title="筛选"
              style={{
                width: '32px',
                height: '32px',
                border: showFilters ? '1px solid rgba(255,255,255,0.2)' : 'none',
                borderRadius: '50%',
                background: showFilters 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'transparent',
                backdropFilter: showFilters ? 'blur(10px)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                outline: 'none'
              }}
            >
              <SFIcon 
                name="line.horizontal.3.decrease.circle" 
                size={16}
                style={{ color: showFilters ? '#FFFFFF' : '#8E8E93' }}
              />
            </button>

            <button 
              onClick={startCreating}
              title="新建卡片"
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: '16px',
                background: isCreating ? '#0A84FF' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                outline: 'none'
              }}
            >
              <SFIcon 
                name="plus.circle.fill" 
                size={16}
                style={{ color: isCreating ? '#FFFFFF' : '#8E8E93' }}
              />
            </button>
          </div>
        </div>

        {/* Notion 风格的筛选条 */}
        {showFilters && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              marginBottom: '12px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '500'
            }}>
              {searchTerm && `搜索 "${searchTerm}" · `}
              显示 {filteredCards.length} / {cards.length} 张卡片
              {activeFilters.length > 0 && ` · ${activeFilters.length} 个筛选条件`}
            </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: activeFilters.length > 0 ? '12px' : '0'
          }}>
            {activeFilters.map((filter, index) => (
              <FilterCondition
                key={filter.id}
                filter={filter}
                onUpdate={(updatedFilter) => {
                  const newFilters = [...activeFilters];
                  newFilters[index] = updatedFilter;
                  setActiveFilters(newFilters);
                }}
                onRemove={() => {
                  setActiveFilters(activeFilters.filter(f => f.id !== filter.id));
                }}
              />
            ))}
            
            <AddFilterButton 
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              customAttributes={customAttributes}
            />
          </div>

            {activeFilters.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveFilters([])}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  清除全部
                </button>
              </div>
            )}
          </div>
        )}

        {/* 卡片内容区 */}
        <div style={{
          flex: 1,
          padding: '32px 16px',
          overflow: 'auto'
        }}>
          {isCreating || isEditing ? (
            <CardEditor 
              formData={formData}
              setFormData={setFormData}
              clozes={clozes}
              setClozes={setClozes}
              onSave={isCreating ? createCard : updateCard}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(false);
                resetForm();
              }}
              renderMarkdownWithCloze={renderMarkdownWithCloze}
              generateAutoCloze={generateAutoCloze}
              isEditing={isEditing}
              customAttributes={customAttributes}
              setCustomAttributes={setCustomAttributes}
              saveCustomAttributes={saveCustomAttributes}
              showToast={showToast}
            />
          ) : currentCard ? (
            <CardDetail
              card={currentCard}
              onEdit={startEditing}
              onDelete={() => deleteCard(currentCard.id)}
              onMarkReviewed={markReviewed}
              renderMarkdownWithCloze={renderMarkdownWithCloze}
              formatDate={formatDate}
              isReviewTime={currentCard.nextReview <= new Date()}
              customAttributes={customAttributes}
            />
          ) : (
            <CardsList
              cards={filteredCards}
              onSelectCard={setCurrentCard}
              selectedCard={currentCard}
              searchTerm={searchTerm}
              formatDate={formatDate}
              highlightText={highlightText}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;