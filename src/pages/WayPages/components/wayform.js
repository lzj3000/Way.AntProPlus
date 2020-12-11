import React from 'react';
import { InfoCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Select, Tooltip, Layout, Modal, Row, Col, Form, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import WayTextBox from './waytext'
import styles from './style.less'

const { Header, Content, Footer } = Layout


class WayForm extends React.Component {
    boxItem = {}
    initboxState = false
    row = null
    command = null
    constructor(props) {
        super(props)
        this.initboxState = false
        this.state = {
            gridnum: 1,
            title: '',
            visible: false,
            submitText: '提交',
            clearText: '取消',
            fields: [],
            extra: null,
        }
        this._propsToState(props)
    }
    _propsToState = (props) => {
        for (var n in this.state) {
            if (n == "fields") continue
            if (props[n]) {
                this.state[n] = props[n]
            }
        }
        if (props.fields) {
            for (var i in props.fields) {
                var field = props.fields[i]
                this.state.fields = props.fields.filter((field) => field.visible && field.isedit && field.title != null && field.title != '')
            }
        }
        console.log(this)
    }

    getBox = (name) => {
        return this.boxItem[name]
    }
    getFieldValue = (field) => {
        var box = this.getBox(field);
        if (box != null)
            return box.getValue();
        return '';
    }
    setFieldValue = (field, value) => {
        var box = this.getBox(field)
        if (box != null) {
            console.log('setFieldValue', value)
            if (box.state.type == "Search") {
                value = box.setRowValue(this.row)
            }
            box.setValue(value);
        }
    }
    getObj = () => {
        var obj = this.row
        if (obj == null)
            obj = {};
        for (var n in this.boxItem) {
            obj[n] = this.boxItem[n].getValue();
        }
        return obj;
    }
    setObj = (obj) => {
        this.row = obj;
        for (var n in this.state.fields) {
            var field = this.state.fields[n]
            field.text = this.row[field.field]
            this.setFieldValue(field.field, field.text);
        }
    }
    clear = () => {
        this.row = null;
        for (var n in this.boxItem) {
            this.boxItem[n].clear();
        }
    }
    show = (command, fn) => {
        var title = this.props.title + command.name
        this.setState({ visible: true, title: title }, () => {
            if (fn)
                fn(this)
        })
    }
    close = () => {
        this.setState({ visible: false })
    }

    onClickSubmit = () => {
        var data = this.getObj();
        if (this.props.onFormSubmit) {
            this.props.onFormSubmit(data, this);
        }
    }
    onClickClear = () => {
        this.clear();
        if (this.props.onFormClear) {
            this.props.onFormClear(this);
        }
        close();
    }
    onFieldChange = (oldv, newv, textbox) => {
        var obj = {
            field: textbox.field,
            textbox: textbox,
            oldvalue: oldv,
            value: newv,
        }
        if (this.props.onFieldChange) {
            this.props.onFieldChange(obj, this);
        }
    }
    onFieldSearch = (searchItem, textbox, callback) => {
        //searchItem.ActionModel = this.getObj()
        if (this.props.onSearch)
            this.props.onSearch(searchItem, textbox, callback, this)
    }
    onRef = (ref) => {
        this.boxItem[ref.state.field] = ref;
        this.initboxState = true
    }
    renderForm = () => {
        if (this.props.model) {
            return (
                <Modal title={this.state.title}
                    width={700}
                    visible={this.state.visible}
                    onOk={() => { this.onClickSubmit() }}
                    onCancel={() => { this.close() }}
                >
                    {this.renderGrid()}
                </Modal>
            )
        }
        else {
            return (
                <Card title={this.props.command == null ? this.props.title : this.props.command.name + this.props.title}
                    className={styles.card} bordered={false}
                    extra={this.state.extra}
                >
                    {this.renderGrid()}
                </Card>
            )
        }
    }
    renderGrid = () => {
        if (this.state.gridnum == 1) {
            return (
                <Form labelCol={{ span: 3, offset: 1 }} wrapperCol={{ span: 18, offset: 0 }}>
                    {this.state.fields.map((field) => {
                        return (
                            <Form.Item label={field.title} key={field.field}>{this.renderTextBox(field)}</Form.Item>
                        )
                    })}
                </Form>
            )
        }
        if (this.state.gridnum == 3) {
            var list = () => {
                const { fields } = this.state
                var res = [];
                for (var i = 0; i < fields.length; i = i + 3) {
                    var f1 = null
                    if (i < fields.length)
                        f1 = <Form.Item label={fields[i].title} key={fields[i].field}>{this.renderTextBox(fields[i])}</Form.Item>
                    var f2 = null
                    if (i + 1 < fields.length)
                        f2 = <Form.Item label={fields[i + 1].title} key={fields[i + 1].field}>{this.renderTextBox(fields[i + 1])}</Form.Item>
                    var f3 = null
                    if (i + 2 < fields.length)
                        f3 = <Form.Item label={fields[i + 2].title} key={fields[i + 2].field}>{this.renderTextBox(fields[i + 2])}</Form.Item>
                    res.push(
                        <Row gutter={[24, 8]} key={i}>
                            <Col span={8}>
                                {f1}
                            </Col>
                            <Col span={8}>
                                {f2}
                            </Col>
                            <Col span={8}>
                                {f3}
                            </Col>
                        </Row>
                    )
                }
                return res
            }
            return (
                <Form layout="vertical">
                    {list}
                </Form>
            )
        }
    }
    renderTextBox = (field) => {
        if (field != undefined && field != null)
            return (<WayTextBox item={field} parent={this} onRef={this.onRef}></WayTextBox>);
    }

    //组件生成时候触发的数据渲染函数03
    render() {
        return (
            <div>{this.renderForm()}</div>
        )
    }

    //组件挂载完成时候触发的生命周期函数04
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)

    }
}
export default WayForm