import React, { useEffect, useMemo, useRef, useState } from 'react';
import Rest from 'tools/rest';
import { Row, Col, Typography, Form, Input, Switch, Button, message, Tabs, Space, Tooltip } from 'antd';
import { parseISO as _parseISO, format } from 'date-fns';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
} from '@ant-design/icons';

import Preloader from 'components/preloader';

const { Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ArticleCard = ({ articleId, onUpdated }) => {
  const [article, setArticle] = useState(null);
  const [formArticle, setFormArticle] = useState(null);
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const contentEditorRef = useRef(null);

  const buildSnapshot = (record) => ({
    title: record?.title || '',
    video_url: record?.video_url || '',
    active: Boolean(record?.active),
    tags_text: (record?.tags || []).join(', '),
    content: record?.content || '',
  });

  const loadArticle = () => {
    if (!articleId) return;

    setLoading(true);
    Rest.get(`/api/v1/articles/${articleId}.json`).then((response) => {
      const loadedArticle = response.data.article;
      const snapshot = buildSnapshot(loadedArticle);
      setArticle(loadedArticle);
      setFormArticle(snapshot);
      setInitialSnapshot(snapshot);
      setErrors({});
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      setLoading(false);
    });
  };

  const hasChanges = useMemo(() => {
    if (!formArticle || !initialSnapshot) return false;
    return JSON.stringify(formArticle) !== JSON.stringify(initialSnapshot);
  }, [formArticle, initialSnapshot]);

  const handleChangeText = (e) => {
    const { name, value } = e.target;
    setFormArticle((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChangeSwitch = (checked) => {
    setFormArticle((prev) => ({ ...prev, active: checked }));
    setErrors((prev) => ({ ...prev, active: null }));
  };

  const getContentTextarea = () => contentEditorRef.current?.resizableTextArea?.textArea;

  const wrapSelection = (before, after = '') => {
    const textarea = getContentTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentContent = formArticle?.content || '';
    const selected = currentContent.slice(start, end) || 'текст';
    const nextContent = `${currentContent.slice(0, start)}${before}${selected}${after}${currentContent.slice(end)}`;

    setFormArticle((prev) => ({ ...prev, content: nextContent }));
    setErrors((prev) => ({ ...prev, content: null }));

    requestAnimationFrame(() => {
      const nextStart = start + before.length;
      const nextEnd = nextStart + selected.length;
      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  };

  const insertAtCursor = (markup) => {
    const textarea = getContentTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentContent = formArticle?.content || '';
    const nextContent = `${currentContent.slice(0, start)}${markup}${currentContent.slice(end)}`;

    setFormArticle((prev) => ({ ...prev, content: nextContent }));
    setErrors((prev) => ({ ...prev, content: null }));

    requestAnimationFrame(() => {
      const cursor = start + markup.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleUpdateArticle = () => {
    if (!articleId || !formArticle) return;

    const payload = {
      title: formArticle.title,
      content: formArticle.content,
      video_url: formArticle.video_url || null,
      active: formArticle.active,
      tags: (formArticle.tags_text || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    setLoading(true);
    Rest.put(`/api/v1/articles/${articleId}.json`, { article: payload }).then((response) => {
      const updatedArticle = response.data.article;
      const snapshot = buildSnapshot(updatedArticle);
      setArticle(updatedArticle);
      setFormArticle(snapshot);
      setInitialSnapshot(snapshot);
      setErrors({});
      message.success('Новость обновлена');
      if (onUpdated) onUpdated(updatedArticle);
    }).catch((e) => {
      setErrors(e?.response?.data?.article?.errors || {});
      message.error('Ошибка обновления новости');
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  return (
    <Preloader loading={loading}>
      <Row gutter={[0, 12]}>
        <Col span={24}>
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item
              label="Заголовок"
              help={errors?.title && errors.title.join(', ')}
              validateStatus={errors?.title ? 'error' : ''}
            >
              <Input
                name="title"
                value={formArticle?.title}
                onChange={handleChangeText}
                placeholder="Заголовок"
              />
            </Form.Item>
            <Form.Item
              label="Видео URL"
              help={errors?.video_url && errors.video_url.join(', ')}
              validateStatus={errors?.video_url ? 'error' : ''}
            >
              <Input
                name="video_url"
                value={formArticle?.video_url}
                onChange={handleChangeText}
                placeholder="https://..."
              />
            </Form.Item>
            <Form.Item label="Опубликована">
              <Switch
                checked={Boolean(formArticle?.active)}
                onChange={handleChangeSwitch}
              />
            </Form.Item>
            <Form.Item
              label="Теги"
              help={errors?.tags && errors.tags.join(', ')}
              validateStatus={errors?.tags ? 'error' : ''}
            >
              <Input
                name="tags_text"
                value={formArticle?.tags_text}
                onChange={handleChangeText}
                placeholder="tag1, tag2, tag3"
              />
            </Form.Item>
            <Form.Item
              label="Контент (HTML)"
              help={errors?.content && errors.content.join(', ')}
              validateStatus={errors?.content ? 'error' : ''}
            >
              <Tabs defaultActiveKey="html">
                <TabPane tab="HTML-разметка" key="html">
                  <Space wrap style={{ marginBottom: 8 }}>
                    <Tooltip title="Жирный">
                      <Button icon={<BoldOutlined />} onClick={() => wrapSelection('<strong>', '</strong>')} />
                    </Tooltip>
                    <Tooltip title="Курсив">
                      <Button icon={<ItalicOutlined />} onClick={() => wrapSelection('<em>', '</em>')} />
                    </Tooltip>
                    <Tooltip title="Подчеркнутый">
                      <Button icon={<UnderlineOutlined />} onClick={() => wrapSelection('<u>', '</u>')} />
                    </Tooltip>
                    <Tooltip title="Зачеркнутый">
                      <Button icon={<StrikethroughOutlined />} onClick={() => wrapSelection('<s>', '</s>')} />
                    </Tooltip>
                    <Tooltip title="Маркированный список">
                      <Button icon={<UnorderedListOutlined />} onClick={() => wrapSelection('<ul><li>', '</li></ul>')} />
                    </Tooltip>
                    <Tooltip title="Нумерованный список">
                      <Button icon={<OrderedListOutlined />} onClick={() => wrapSelection('<ol><li>', '</li></ol>')} />
                    </Tooltip>
                    <Tooltip title="Ссылка">
                      <Button icon={<LinkOutlined />} onClick={() => wrapSelection('<a href=\"https://example.com\" target=\"_blank\" rel=\"noreferrer\">', '</a>')} />
                    </Tooltip>
                    <Button onClick={() => wrapSelection('<h3>', '</h3>')}>H3</Button>
                    <Button onClick={() => wrapSelection('<p>', '</p>')}>P</Button>
                    <Button onClick={() => insertAtCursor('<br />')}>BR</Button>
                  </Space>
                  <TextArea
                    ref={contentEditorRef}
                    name="content"
                    value={formArticle?.content}
                    onChange={handleChangeText}
                    rows={12}
                    style={{ fontFamily: 'monospace' }}
                  />
                </TabPane>
                <TabPane tab="Предпросмотр" key="preview">
                  <div
                    style={{ wordBreak: 'break-word', minHeight: 160 }}
                    dangerouslySetInnerHTML={{ __html: formArticle?.content || '' }}
                  />
                </TabPane>
              </Tabs>
            </Form.Item>
            {hasChanges && (
              <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
                <Button type="primary" onClick={handleUpdateArticle}>
                  Сохранить
                </Button>
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
    </Preloader>
  );
};

export default ArticleCard;
