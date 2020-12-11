import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DatePicker, Input, InputNumber, Select, Tooltip, Switch, Modal, Space } from 'antd';
import moment from 'moment';
import WayTable from './waytable'

const { Search } = Input
const { RangePicker } = DatePicker;
export default class WayTextBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: '',
            field: '',
            title: '',
            value: '',
            hidevalue: '',
            modelvisible: false,
            table: {},
            Input: {
                ref: React.createRef(),
                autoFocus: false,
                addonAfter: '',
                addonBefore: '',
                defaultValue: '',
                disabled: false,
                maxLength: 500,
                prefix: '',
                size: 'middle',
                suffix: '',
                type: 'text',
                allowClear: true,
                placeholder: '',
                style: { width: '100%' },
                onPressEnter: (event) => {
                    this.onPressEnter(event);
                },
                onBlur: (event) => {
                    this.onBlur(event);
                },
                onFocus: (event) => {
                    this.onFocus(event);
                }
            },
            Search: {
                enterButton: false,
                loading: false
            },
            InputNumber: {
                max: 99999999999,
                min: 0,
                decimalSeparator: '0',
                step: 1
            },
            DatePicker: {
                picker: 'date',
                inputReadOnly: false,
            },
            Switch: {
                checkedChildren: "是",
                unCheckedChildren: "否",
                defaultChecked: false
            },
            Select: {
                autoClearSearchValue: true,
                defaultActiveFirstOption: true,
                dropdownMatchSelectWidth: true,
                dropdownRender: null,
                listHeight: 256,
                mode: null,
                options: []//{label, value}
            }
        }
        this._propsTostate(props)
    }
    _propsTostate = (props) => {
        if (props.item) {
            this.state.type = this.getTextType(props)
            this.state.field = props.item.field;
            this.state.title = props.item.title;
            this.state.Input.disabled = props.item.disabled;
        }
        else {
            this.state.type = props.type;
            this.state.field = props.field;
            this.state.title = props.title;
        }
        if (props.text != undefined) {
            this.state.value = this.setVlalueFormat(props.text)
        }
        this.setPropsToState(props, this.state.Input)
        var typestate = this.state[this.state.type];
        this.setPropsToState(props, typestate)
        if (props.search)
            this.state.Input.disabled = false
        this._defaultDisplay(props)

    }
    _defaultDisplay = (props) => {
        switch (this.state.type) {
            case 'Switch':
                if (props.search) {
                    this.state.type = 'Select'
                    this.initSelect(props)
                    this.state[this.state.type].options = [{ label: '是', value: true }, { label: '否', value: false }]
                }
                else
                    this.initSwitch(props)
                break
            case 'InputNumber':
                this.initInputNumber(props)
                break
            case 'DatePicker':
                this.initDatePicker(props)
                break
            case 'Select':
                this.initSelect(props)
                break
            case 'Search':
                this.initSearch(props)
                break
        }
    }
    setPropsToState = (props, state) => {
        for (var n in state) {
            if (props[n])
                state[n] = props[n]
        }
    }

    initSwitch = (props) => {
        const { Input } = this.state;
        delete Input.style
        delete Input.allowClear
        delete Input.addonBefore
        delete Input.onPressEnter
        delete Input.addonAfter
        delete Input.formatter
        Input.onChange = (checked, event) => {
            this.setState({ value: checked });
            this.onChange(!checked, checked, event);
        }
    }
    initSelect = (props) => {
        const { Input } = this.state;
        delete Input.addonBefore
        delete Input.onPressEnter
        delete Input.addonAfter
        delete Input.formatter
        Input.allowClear = false
        Input.onChange = (value, option) => {
            this.setState({ value: value });
            this.onChange(this.state.value, value, event);
        }
        Input.onSelect = (value, option) => {
            this.onSelect(value, option);
        }
        var options = this.state[this.state.type].options

        if (props && props.item && options.length == 0) {
            if (props.item.comvtp && props.item.comvtp.isvtp) {
                for (var i in props.item.comvtp.items) {
                    options.push({ label: props.item.comvtp.items[i], value: Number(i) })
                }
            }
        }
    }
    initInputNumber = (props) => {
        const { Input } = this.state;
        Input.onChange = (value) => {
            this.setState({ value: value })
            this.onChange(this.state.value, value, this)
        }
    }
    initDatePicker = (props) => {
        const { Input } = this.state;
        Input.onChange = (date, dateString) => {
            this.setState({ value: date });
            this.onChange(this.state.value, date, this);
        }
    }
    initSearch = (props) => {
        var textfield = "Name"
        var valuefield = "Id"
        const { Input } = this.state
        Input.allowClear = false
        Input.onSearch = (value, event) => {
            this.onSearch(value, event);
        }
        if (props && props.item && props.item.foreign) {
            textfield = props.item.foreign.oneDisplayName
            valuefield = props.item.foreign.oneObjecFiledKey
        }
        this.state.table = {
            columns: null,
            valuefield: valuefield,
            textfield: textfield,
            data: {
                list: [],
                total: 0
            },
            onSearchClick: (item, table) => {
                this.searchForeign(item, table)
            },
            onRowClick: (row, table) => {
                this.setValue(this.setSearchValue(row))
            },
            onRowDoubleClick: (row, table) => {
                console.log('text.onRowDoubleClick.row')
                this.setState({ modelvisible: false })
            },
        }
        if (props && props.row) {
            this.state.value = this.setRowValue(props.row)
        }
    }
    getTextType = (props) => {
        if (props.item) {
            if (props.item.comvtp && props.item.comvtp.isvtp) {
                return "Select"
            }
            if (props.item.foreign && props.item.foreign.isfkey) {
                return "Search"
            }
        }
        if (props.item.type == "datetime") {
            return "DatePicker"
        }
        if (props.item.type == "boolean") {
            return "Switch"
        }
        if (props.item.field == "Remark") {
            return "Input.TextArea"
        }
        if (props.item.type == "int" || props.item.type == "int32" || props.item.type == "int64" || props.item.type == 'decimal') {
            return "InputNumber"
        }
        return "Input"
    }
    setSearchValue = (row) => {
        if (this.state.type == "Search") {
            if (row == null) return ""
            const { table } = this.state
            var v = row[table.valuefield]
            var t = row[table.textfield]
            this.state.hidevalue = v
            return t
        }
    }
    setRowValue = (row) => {
        if (this.state.type == "Search") {
            var foreign = this.props.item.foreign
            var vv = row[foreign.oneObjecFiled]
            return this.setSearchValue(vv);
        }
    }
    searchForeign = (item, table) => {
        item.foreignfield = this.state.field
        if (this.props.parent && this.props.parent.onFieldSearch) {
            this.props.parent.onFieldSearch(item, this, (res) => {
                table.setDataSource(res.result)
            })
        }
    }
    setDisabled = (disabled) => {
        this.setState({ Input: { disabled: disabled } });
    }
    setVlalueFormat = (value) => {
        if (this.state.type == "DatePicker") {
            if (value == null || value == "")
                value = null
            else
                value = moment(value, 'YYYY-MM-DD HH:mm:ss');
        }
        if (this.state.type == "Switch") {
            if (typeof value != "boolean")
                value = false
        }
        return value
    }
    getValue = () => {
        if (this.state.type == "Search") {
            return this.state.hidevalue
        }
        if (this.props.item.type == "datetime") {
            if (this.state.value != null && this.state.value != '')
                return this.state.value.format('YYYY-MM-DD HH:mm:ss').toString()
            else
                return null
        }
        if (this.props.item.type == "int" || this.props.item.type == "int32" || this.props.item.type == "int64") {
            if (this.state.value != null && this.state.value != '')
                return Number(this.state.value)
            else
                return 0
        }
        return this.state.value;
    }
    setValue = (value) => {
        value = this.setVlalueFormat(value)
        let oldv = this.state.value
        this.setState({ value: value }, () => {
            if (this.state.type == "Search") {
                this.onChange(oldv, value, this)
            }
        });
    }
    clear = () => {
        this.state.hidevalue = '';
        this.setValue(null);
    }
    onBlur = (event) => {
        if (this.props.onBlur) {
            this.props.onBlur(this);
        }
    }
    blur = () => {
        this.state.Input.ref.current.blur();
    }
    focus = () => {
        this.state.Input.ref.current.focus();
    }
    select = () => {
        this.state.Input.ref.current.input.setSelectionRange(0, this.state.value.length);
    }
    onPressEnter = (event) => {
        if (this.props.onPressEnter) {
            this.props.onPressEnter(this)
        }
        if (this.props.parent && this.props.parent.onFieldPressEnter) {
            this.props.parent.onFieldPressEnter(this);
        }
    }
    onChange = (oldv, newv, event) => {
        if (this.props.onChange) {
            this.props.onChange(oldv, newv, this)
        }
        if (this.props.parent && this.props.parent.onFieldChange) {
            this.props.parent.onFieldChange(oldv, newv, this);
        }
    }
    onSearch = (value, event) => {
        var item = {
            foreignfield: this.state.field
        }
        if (this.props.onSearch) {
            this.props.onSearch(item, this, this.showSearchForm)
        }
        if (this.props.parent && this.props.parent.onFieldSearch) {
            this.props.parent.onFieldSearch(item, this, this.showSearchForm);
        }
    }
    showSearchForm = (res) => {
        if (this.state.modelvisible == false) {
            console.log(res)
            var view = res.result.view;
            const { table } = this.state
            table.columns = view.childitem
            table.data.list = res.result.list
            table.data.total = res.result.total
            this.setState({ modelvisible: true, table: table })
        }
    }
    onSelect = (value, option) => {
        if (this.props.onSelect) {
            this.props.onSelect(value, option, this)
        }
        if (this.props.parent && this.props.parent.onFieldSelect) {
            this.props.parent.onFieldSelect(value, option, this);
        }
    }
    onFocus = (event) => {
        if (this.props.onFocus) {
            this.props.onFocus(this)
        }
        if (this.props.parent && this.props.parent.onFieldFocus) {
            this.props.onFieldFocus(this);
        }
    }
    componentWillReceiveProps(nextProps) {
        this._propsTostate(nextProps)
    }
    render() {
        console.log('text.render.' + this.state.field, this)
        var data = this.state.Input
        const typedata = this.state[this.state.type]
        if (this.state.type == 'Select') {
            return (<Select {...data} value={this.state.value} {...typedata}></Select>)
        }
        if (this.state.type == 'Search') {
            return (<>
                <Search {...data} value={this.state.value} {...typedata} >
                </Search>
                <Modal title={this.state.title}
                    width={800}
                    destroyOnClose={true}
                    visible={this.state.modelvisible}
                    onCancel={() => { this.setState({ modelvisible: false }) }}>
                    <WayTable {...this.state.table}></WayTable>
                </Modal></>
            )
        }
        if (this.state.type == 'DatePicker') {
            if (this.props.search) {
                return (<RangePicker {...data} {...typedata} value={this.state.value}></RangePicker>)
            }
            else
                return (<DatePicker {...data} {...typedata} value={this.state.value}></DatePicker>)
        }
        if (this.state.type == "Switch") {
            return (<Switch {...data} {...typedata} checked={this.state.value} />)
        }
        if (this.state.field == "Input.TextArea") {
            return (<Input.TextArea rows={4} {...data} value={this.state.value}></Input.TextArea>)
        }
        if (this.state.type == "InputNumber") {
            return (<InputNumber {...data} {...typedata} value={this.state.value}></InputNumber>)
        }
        return (<Input {...data} value={this.state.value} onChange={(event) => {
            this.setState({ value: event.target.value });
            this.onChange(this.state.value, event.target.value, this)
        }}></Input>)
    }
    //组件挂载完成时候触发的生命周期函数04
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)
    }

    // componentDidUpdate(){
    //     if (this.props.onRef)
    //     this.props.onRef(this)
    // }

}