import React, { useEffect, useState, useMemo } from 'react';
import Rest from 'tools/rest';
import { Table, Row, Col, Form, Input, Modal, Typography, BackTop, Popconfirm, Button, message, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { parseISO as _parseISO, format } from 'date-fns';
import { debounce } from 'lodash';

import Preloader from 'components/preloader';
import ArticleCard from 'components/article_card';

const { Text } = Typography;

const Articles = () => {
  const readQueryState = () => {
    const query = new URLSearchParams(window.location.search);

    return {
      meta: {
        page: Number(query.get('page')) || 1,
        per: Number(query.get('per')) || 20,
        total: 0,
      },
      search: {
        id: query.get('id') || null,
        title: query.get('title') || null,
        active: query.get('active') || null,
        tags: query.get('tags') || null,
      },
    };
  };

  const initialQueryState = readQueryState();

  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState(initialQueryState.meta);
  const [search, setSearch] = useState(initialQueryState.search);
  const [loading, setLoading] = useState(false);
  const [visibleCard, setVisibleCard] = useState(false);
  const [article, setArticle] = useState(null);
  const [dataRelevance, setDataRelevance] = useState(null);

  const loadArticles = () => {
    const params = {
      page: meta.page,
      per: meta.per,
      search,
    };

    setLoading(true);
    Rest.get('/api/v1/articles.json', { params }).then((response) => {
      const { articles: loadedArticles, meta: loadedMeta } = response.data;
      setArticles(loadedArticles || []);
      setMeta((prev) => ({
        ...prev,
        page: loadedMeta?.page || prev.page,
        per: loadedMeta?.per || prev.per,
        total: loadedMeta?.total || 0,
      }));
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadArticles();
  }, [meta.page, meta.per, search, dataRelevance]);

  const debouncedSearchChange = useMemo(() => {
    return debounce((name, value) => {
      setMeta((prev) => ({ ...prev, page: 1 }));
      setSearch((prev) => ({ ...prev, [name]: value }));
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  useEffect(() => {
    const query = new URLSearchParams();

    Object.entries(search).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.set(key, value);
      }
    });

    query.set('page', String(meta.page));
    query.set('per', String(meta.per));

    const nextUrl = `${window.location.pathname}?${query.toString()}`;
    window.history.replaceState(null, '', nextUrl);
  }, [search, meta.page, meta.per]);

  const handleChangeText = (e) => {
    const { name, value } = e.target;
    debouncedSearchChange(name, value || null);
  };

  const handleTableChange = (pagination) => {
    setMeta((prev) => ({
      ...prev,
      page: pagination.current,
      per: pagination.pageSize,
    }));
  };

  const handleChangeStatus = (value) => {
    setMeta((prev) => ({ ...prev, page: 1 }));
    setSearch((prev) => ({ ...prev, active: value ?? null }));
  };

  const handleDelete = (id) => {
    setLoading(true);
    Rest.delete(`/api/v1/articles/${id}.json`).then(() => {
      message.success('Новость удалена');
      if (article?.id === id) {
        setVisibleCard(false);
      }
      setDataRelevance(new Date());
    }).catch((e) => {
      console.error('error', e);
      message.error('Ошибка удаления новости');
    }).finally(() => {
      setLoading(false);
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
      render: (value) => (value && value.length ? value.join(', ') : '-'),
    },
    {
      title: 'Статус',
      dataIndex: 'active',
      key: 'active',
      width: 140,
      render: (value) => (value ? 'Опубликована' : 'Скрыта'),
    },
    {
      title: 'Создана',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (value) => (value ? format(_parseISO(value), 'dd.MM.yyyy HH:mm') : null),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Удалить новость?"
          description={`Новость № ${record.id} будет удалена безвозвратно`}
          onConfirm={(event) => {
            event?.stopPropagation?.();
            handleDelete(record.id);
          }}
          onCancel={(event) => event?.stopPropagation?.()}
          okText="Удалить"
          cancelText="Отмена"
        >
          <Button
            danger
            size="small"
            onClick={(event) => event.stopPropagation()}
          >
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const pagination = {
    current: meta.page,
    pageSize: meta.per,
    total: meta.total,
    position: ['bottomCenter'],
    showSizeChanger: true,
  };

  return (
    <React.Fragment>
      <BackTop />
      <PageHeader title="Реестр новостей" />
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="ID:"
              style={{ marginBottom: '5px' }}
            >
              <Input
                name="id"
                defaultValue={search.id}
                placeholder="Поиск по id"
                onChange={handleChangeText}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Заголовок:"
              style={{ marginBottom: '5px' }}
            >
              <Input
                name="title"
                defaultValue={search.title}
                placeholder="Поиск по заголовку"
                onChange={handleChangeText}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Статус:"
              style={{ marginBottom: '5px' }}
            >
              <Select
                allowClear
                value={search.active}
                placeholder="Любой"
                onChange={handleChangeStatus}
                options={[
                  { label: 'Опубликована', value: 'true' },
                  { label: 'Скрыта', value: 'false' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Теги:"
              style={{ marginBottom: '5px' }}
            >
              <Input
                name="tags"
                defaultValue={search.tags}
                placeholder="Поиск по тегам"
                onChange={handleChangeText}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Preloader loading={loading}>
        <Row gutter={20}>
          <Col style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </Col>
        </Row>
        <Table
          style={{ marginTop: '10px' }}
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={articles}
          onChange={handleTableChange}
          pagination={pagination}
          onRow={(record) => ({
            onClick: () => {
              setArticle(record);
              setVisibleCard(true);
            },
          })}
        />
      </Preloader>
      {visibleCard && (
        <Modal
          title={`Новость № ${article?.id}`}
          visible={visibleCard}
          onCancel={() => setVisibleCard(false)}
          onOk={() => setVisibleCard(false)}
          footer={false}
          width="70%"
        >
          <ArticleCard
            articleId={article?.id}
            onUpdated={() => {
              setVisibleCard(false);
              setArticle(null);
              setDataRelevance(new Date());
            }}
          />
        </Modal>
      )}
    </React.Fragment>
  );
};

export default Articles;
