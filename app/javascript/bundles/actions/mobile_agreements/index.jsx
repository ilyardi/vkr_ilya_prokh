import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Card, Typography, Tag, Spin } from 'antd';
import { Button as AntdButton } from 'antd';
import { SearchBar, Space, Badge } from 'antd-mobile';
import { SlidersOutlined, ClearOutlined } from '@ant-design/icons';
import Rest from 'tools/rest';
import FilterPanel from './filter_panel';
import { withStyles } from '@material-ui/core/styles';

const { Text, Paragraph } = Typography;

// --- Helper Functions ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
// --------------------

const styles = (theme) => ({
  main: {
    height: 'calc(100vh - 60px)', // Full height minus action bar
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f0f2f5',
  },
  content: {
    height: '90%',
    overflowY: 'scroll',
    padding: '8px',
    scrollbarWidth: 'none'
  },
  actions: {
    height: '70px',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    gap: '8px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px', // Creates a larger tappable area
    fontSize: '24px', // Keep icon size consistent
  },
});

const SESSION_STORAGE_KEY = 'mobileAgreements_filters';

const MobileAgreements = ({ classes }) => {
  const history = useHistory();
  const location = useLocation();

  const getInitialState = () => {
    const paramsFromUrl = queryString.parse(location.search, { parseNumbers: true, parseBooleans: true });
    try {
        const savedFiltersJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const savedFilters = savedFiltersJSON ? JSON.parse(savedFiltersJSON) : {};
        // URL agrm_id always wins/is preserved over the saved state.
        return { ...savedFilters, agrm_id: paramsFromUrl.agrm_id };
    } catch (e) {
        // On error, just use URL params for the agrm_id.
        return { agrm_id: paramsFromUrl.agrm_id };
    }
  };

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(getInitialState);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const listRef = useRef(null);
  const isInitialMount = useRef(true);

  const debouncedSearch = useDebounce(search, 500);

  // Save state to sessionStorage on every change
  useEffect(() => {
    try {
        const { agrm_id, ...filtersToSave } = search;
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(filtersToSave));
    } catch (e) {
        console.error("Failed to save filters to session storage", e);
    }
  }, [search]);

  const loadAgreements = useCallback((currentPage, currentSearch) => {
    setLoading(true);
    
    const { agrm_id, ...filterParams } = currentSearch;
    if (filterParams.number) {
        filterParams.number = String(filterParams.number);
    }

    Rest.get('/api/v1/lb_agreements.json', {
      params: { page: currentPage, per: 20, filter: filterParams },
    })
      .then((response) => {
        const { lb_agreements, meta } = response.data;
        setAgreements(prev => currentPage === 1 ? lb_agreements : [...prev, ...lb_agreements]);
        setHasMore(lb_agreements.length > 0 && meta.total > currentPage * meta.per);
        setPage(currentPage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  
  // This hook ONLY syncs agrm_id FROM the URL TO the state, preserving other filters from sessionStorage.
  useEffect(() => {
    const params = queryString.parse(location.search);
    const agrmIdFromUrl = params.agrm_id || null;
    if (agrmIdFromUrl !== search.agrm_id) {
        setSearch(prev => ({ ...prev, agrm_id: agrmIdFromUrl }));
    }
  }, [location.search]);

  // This hook reloads data when the debounced search state changes.
  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        loadAgreements(1, search);
    } else {
        loadAgreements(1, debouncedSearch);
    }
  }, [debouncedSearch, loadAgreements]);

  const applyFilters = (newFilters) => {
    // When applying new filters, we preserve a potential agrm_id from the current state.
    setSearch(prev => ({ agrm_id: prev.agrm_id, ...newFilters }));
  };

  const handleReset = () => {
    // When resetting, we clear everything EXCEPT a potential agrm_id.
    setSearch({ agrm_id: search.agrm_id });
  };

  const handleScroll = useCallback(() => {
    const container = listRef.current;
    if (container && !loading && hasMore) {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
        // We use the current, non-debounced search state for pagination to feel responsive.
        loadAgreements(page + 1, search);
      }
    }
  }, [loading, hasMore, page, search, loadAgreements]);

  useEffect(() => {
    const container = listRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const handleAgreementClick = (item) => {
    history.push({
      pathname: `/m/agreements/${item.id}`,
    });
  };

  const renderAgreementCard = (item) => {
    let statusTag;
    switch (item.lk_status) {
      case 'confirmed_lk': statusTag = <Tag color="success">ПЛК</Tag>; break;
      case 'unconfirmed_lk': statusTag = <Tag color="processing">ЛК</Tag>; break;
      case 'no_lk': statusTag = <Tag>Без ЛК</Tag>; break;
      default: statusTag = null;
    }

    return (
      <Card
        key={item.id}
        hoverable
        style={{ width: '100%' }}
        styles={{ body: { padding: '12px' } }}
        onClick={() => handleAgreementClick(item)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <Text strong style={{ fontSize: '16px' }}>{`Договор № ${item.number}`}</Text>
            {statusTag}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Paragraph strong style={{ marginBottom: 0 }}>{item.name}</Paragraph>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>{item.address}</Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
                Баланс: <Text type={item.balance < 0 ? 'danger' : 'success'}>{item.balance} ₽</Text>
            </Paragraph>
        </div>
      </Card>
    );
  };

  // Correctly calculate the number of active filters
  const { agrm_id, ...filterParams } = search;
  const appliedFilterCount = Object.values(filterParams).filter(
    v => v !== null && v !== '' && v !== undefined && (!Array.isArray(v) || v.length > 0)
  ).length;

  return (
    <>
      <FilterPanel
        key={JSON.stringify(search)}
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={applyFilters}
        initialSearch={search}
      />
      <div className={classes.main}>
        <div ref={listRef} className={classes.content}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading && agreements.length === 0 ? (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}><Spin size="large"/></div>
            ) : (
              <>
                {agreements.map(item => renderAgreementCard(item))}
                {loading && agreements.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '16px' }}><Spin /></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className={classes.actions}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Номер договора"
            value={search.number || ''}
            onChange={(value) => setSearch(prev => ({ ...prev, number: value }))}
            onClear={() => applyFilters({ ...search, number: null })}
            style={{ 
                '--background': '#f0f2f5', 
                '--border-radius': '20px'
            }}
          />
        </div>
        {appliedFilterCount > 0 && (
          <Badge content={appliedFilterCount}>
            <AntdButton
              type="text"
              onClick={handleReset}
              className={classes.actionButton}
            >
              <ClearOutlined />
            </AntdButton>
          </Badge>
        )}
        <AntdButton
            type="text"
            onClick={() => setIsFilterVisible(true)}
            className={classes.actionButton}
        >
          <SlidersOutlined />
        </AntdButton>
      </div>
    </>
  );
};

export default withStyles(styles)(MobileAgreements);
