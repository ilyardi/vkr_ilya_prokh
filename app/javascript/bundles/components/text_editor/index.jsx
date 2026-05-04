import React from 'react';
import ReactDOM from 'react-dom';
import {
  ContentState,
  convertFromHTML,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils
} from 'draft-js';
import { Form, Button, Divider, Select, InputNumber } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  FontSizeOutlined,
  FileImageOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { find as _find, map as _map } from 'lodash';
import RichTextEditor from 'react-rte';
import 'draft-js/dist/Draft.css';

const { Option } = Select;
const styleMap = {
  'STYLENAME': {
    propertyName: 'red',
  },
};

class TextEditor extends React.Component {

  markup = "Уважаемые абоненты!<br />\r\nДоводим до вашего сведения, что с 1 февраля 2022 года будут внесены изменения" +
    " в&nbsp; Базовые тарифы на услуги связи для целей телевизионного вещания, предоставляемые ООО &quot;" +
    "ТЕЛЕСЕТЬ&quot;.<br />\r\n<br />\r\n<br />\r\nНиже приведены тарифы, которые будут действовать с 1 февраля 2022 г." +
    "<br />\r\n<br />\r\n" +
    "<img alt=\"\" src=\"/uploads/ckeditor/pictures/17/content_%D0%91%D0%B0%D0%B7%D0%BE%D0%B2%D1%8B%D0%B5_%D1%82%D0%B0%D1%80%D0%B8%D1%84%D1%8B_%D0%BD%D0%B0_%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8_%D1%81%D0%B2%D1%8F%D0%B7%D0%B8_%D0%B4%D0%BB%D1%8F_%D1%86%D0%B5%D0%BB%D0%B5%D0%B9_%D1%82%D0%B5%D0%BB%D0%B5%D0%B2%D0%B8%D0%B7%D0%B8%D0%BE%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE_%D0%B2%D0%B5%D1%89%D0%B0%D0%BD%D0%B8%D1%8F.png\" style=\"width: 700px; height: 705px;\" />" +
    "<br />\r\n<br />\r\nСо Специальными тарифами&nbsp;на оказание услуг связи для целей телевизионного вещания Вы можете ознакомиться в разделе &quot;Документы&quot;.<br />\r\n&nbsp;"

  blocksFromHtml = convertFromHTML(this.markup)
  prevEditor = ContentState.createFromBlockArray(
    this.blocksFromHtml.contentBlocks,
    this.blocksFromHtml.entityMap,
  );
  state = {
    // editorState: EditorState.createWithContent(this.prevEditor)
    editorState: EditorState.createEmpty()
  };

  onChange = (editorState) => {
    console.log(convertToRaw(editorState.getCurrentContent()))
    this.setState({ editorState: editorState })
  }

  handleInlineStyle = (inlineStyle) => {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const { editorState } = this.state
    return (
      <React.Fragment>
        <div style={{ height: "400px", border: "2px solid gray", borderRadius: "5px", padding: "15px", backgroundColor: "white" }}>
          <Form layout="inline">
            <Form.Item style={{ margin: "0px 5px" }}>
              <Button
                icon={<BoldOutlined />}
                style={{ border: "none" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  this.handleInlineStyle('BOLD');
                }}
              />
            </Form.Item>
            <Form.Item style={{ margin: "0px 5px" }}>
              <Button
                icon={<ItalicOutlined />}
                style={{ border: "none" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  this.handleInlineStyle('ITALIC');
                }}
              />
            </Form.Item>
            <Form.Item style={{ margin: "0px 5px" }}>
              <Button
                icon={<UnderlineOutlined />}
                style={{ border: "none" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  this.handleInlineStyle('UNDERLINE');
                }}
              />
            </Form.Item>
            <Form.Item noStyle={true}>
              <Select defaultValue={12}>
                {_map([8, 9, 10, 12, 14, 16, 18, 20, 22, 24], (item) => {
                  return <Option key={item}>{item}</Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item style={{ margin: "0px 5px 0px 0px" }}>
              <Select
                suffixIcon={<FontSizeOutlined />}
                style={{ width: '200px' }}
                defaultValue={"Times New Roman"}
              >
                <Option key={"Arial"}>{"Arial"}</Option>
                <Option key={"Verdana"}>{"Verdana"}</Option>
                <Option key={"Times New Roman"}>{"Times New Roman"}</Option>
                <Option key={"Georgia"}>{"Georgia"}</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ margin: "0px 5px" }}>
              <Button icon={<FileImageOutlined />} style={{ border: "none" }} />
            </Form.Item>
            <Form.Item style={{ margin: "0px 5px" }}>
              <Button icon={<LinkOutlined />} style={{ border: "none" }} />
            </Form.Item>
          </Form>
          <Divider style={{ margin: "10px 0px" }} />
          <Editor
            editorState={editorState}
            onChange={this.onChange}
            placeholder="Новости..."
            customStyleMap={styleMap}
          />
        </div>
      </React.Fragment>
    )
  }
}

export default TextEditor