import React from 'react';
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Menu, message, Input, Modal, Form, Tooltip, Table, Row, Col, Select, Cascader } from 'antd';
import moment from 'moment';
import WayTextBox from './waytext'
import WayToolbar from './waytoolbar'

const { confirm } = Modal;
const { Search } = Input;


export default class WayEditTable extends React.Component {
    selectRows = null
    clickRow = null
    RemoveList = []
    ForeignList = []
    searchWhere = null
    toolbar = null
    search = {
        findId: 0,
        pageindex: 1,
        pagesize: 10,
        foreignfield: '',
        detailname: '',
        fields: [],
        WhereList: [],//{name:'',value:null}
        OrderbyList: [],//{name:'',isdesc:false}
        ActionModel: null
    }
    constructor(props) {
        super(props)
        this.state = {
            type: 'add',//add||edit
            search: true,
            toolbar: false,
            table: null,
            loading: false,
            data: {
                list: [],
                total: 0
            }
        }
        this._propsToState(props)
    }
    _propsToState = (props) => {
        this.state.toolbar = this.initToolbar(props)
        this.state.table = this.initTable(props)
        if (props.data)
            this.state.data = props.data
        this._defaultDisplay(props)
    }
    _defaultDisplay = (props) => {
        if (props.search == undefined && this.state.type != 'add') {
            if (this.state.toolbar)
                this.state.toolbar.search = true
        }
    }
    initToolbar = (props) => {
        var toolbar = {
            type: 'table',
            divider: true,
            fields: props.fields,
            search: false,
            commands: null
        }
        if (props.toolbar != undefined) {
            if (props.toolbar === false)
                return false
            else {
                for (var n in toolbar) {
                    if (props.toolbar[n])
                        toolbar[n] = props.toolbar[n]
                }
            }
        }
        toolbar.parent = this
        toolbar.onRef = (ref) => { this.toolbar = ref }
        return toolbar
    }

    initTable = (props) => {
        var table = {
            tableLayout: 'fixed',
            rowKey: 'Id',
            search: true,
            columns: [],
            bordered: true,
            rowSelection: {
                fixed: true,
                columnWidth: '60px',
                selections: true,
                selectedRowKeys: [],
                onChange: (selectedRowKeys, selectedRows) => {
                    console.log(selectedRowKeys)
                    let rowSelection = Object.assign({}, this.state.table.rowSelection, { selectedRowKeys: selectedRowKeys })
                    let table = Object.assign({}, this.state.table, { rowSelection: rowSelection })
                    this.setState({ table: table }, () => {
                        if (this.toolbar)
                            this.toolbar.setSelectDisabled(selectedRows.length)
                        this.onRowSelect(selectedRows)
                    })
                }
            },
            onRow: (record) => {
                return {
                    onClick: event => {
                        event.stopPropagation()
                        this.onRowClick(record)
                    },
                    onDoubleClick: event => {
                        console.log("formtable.onDoubleClick.row")
                        event.stopPropagation()
                        this.onRowDoubleClick(record)
                    },
                };
            }
        }
        for (var n in table) {
            if (props[n])
                table[n] = props[n];
        }
        table.columns = this.getColumns(props.fields)
        return table
    }

    getColumns = (fields) => {
        var cols = []
        if (fields) {
            for (var i in fields) {
                if (fields[i].visible && fields[i].title != null && fields[i].isedit) {
                    cols.push(this.getProColumn(fields[i]))
                    if (fields[i].foreign && fields[i].foreign.isfkey) {
                        this.ForeignList.push(fields[i].foreign)
                    }
                }
            }
        }
        cols = cols.map((col, index) => ({
            ...col,
            render: (text, record, rowindex) => {
                if (record.editable) {
                    return (
                        <WayTextBox item={col.item} text={text} row={record} autoFocus={index == 0} parent={this} placeholder={col.item.title}
                            onChange={(oldv, newv, box) => {
                                record[box.state.field] = newv
                                if (box.state.type == "Search") {
                                    record[box.state.field] = box.getValue()
                                    let p = box.props.item.foreign.oneObjecFiled
                                    let n = box.props.item.foreign.oneDisplayName
                                    let k = box.props.item.foreign.oneObjecFiledKey
                                    var no = {}
                                    no[k] = record[box.state.field]
                                    no[n] = newv
                                    record[p] = no
                                    console.log(record)
                                }
                            }}
                            onSearch={(search, textbox, fn) => {
                                search.detailname = this.props.parent.type
                                this.props.parent.parent.onSearch(search, textbox, fn, this)
                            }}
                        ></WayTextBox>
                    )
                }
                if (col.item.foreign && col.item.foreign.isfkey) {
                    var obj = record[col.item.foreign.oneObjecFiled]
                    if (obj) {
                        var vvv = obj[col.item.foreign.oneDisplayName]
                        return vvv
                    }
                }
                if (col.valueEnum != undefined && text != null) {
                    return col.valueEnum[text].text
                }
                return text;
            }
        }))
        return cols
    }
    getProColumn = (item) => {
        var type = this.getvalueType(item);
        var venum = this.getvalueEnum(item);
        var column = { align: 'center', width: 150, ellipsis: true, title: item.title, dataIndex: item.field, valueEnum: venum, valueType: type, item: item }
        return column;
    }
    getvalueType = (item) => {
        switch (item.type) {
            case "datetime":
                return "date";
            case "int":
            case "int64":
                return "digit";
        }
        if (item.field == "remark")
            return "textarea"
        return "text";
    }
    getvalueEnum = (item) => {
        if (item.type == "boolean") {
            let valueEnum = { false: { text: "否" }, true: { text: "是" } };
            return valueEnum;
        }
        if (item.comvtp && item.comvtp.isvtp) {
            let valueEnum = {};
            for (var n in item.comvtp.items) {
                var data = item.comvtp.items[n];
                valueEnum[n] = { text: data };
            }
            return valueEnum;
        }
        return undefined;
    }
    onFieldSearch = (searchItem, textbox, callback) => {
        console.log('WayEditTable.onFieldSearch')
        if (this.props.onFieldSearch)
            this.props.onFieldSearch(searchItem, textbox, callback, this)
    }
    onSearchClick = (params, where) => {
        this.search.pageindex = 1
        this.search.WhereList = []
        this.search.foreignfield = ''
        this.search.detailname = ''
        this.search.OrderbyList = []
        if (params != null) {
            for (var n in params) {
                this.search.WhereList.push({ name: n, value: params[n] })
            }
        }
        if (where && where.name != '*' && where.name != '' && where.value != '') {
            this.search.WhereList.push({ name: where.name, value: where.value, symbol: where.symbol })
        }
        console.log('wayedittable.onSearchClick', this.search)
        this.setState({ loading: true })
        if (this.props.onSearchClick) {
            this.props.onSearchClick(this.search, this)
        }
    }

    reload = () => {
        this.search.pageindex = 1
        this.setState({ loading: true })
        if (this.props.onSearchClick) {
            this.props.onSearchClick(this.search, this)
        }
    }

    setDataSource = (data) => {
        console.log('setDataSource')
        if (data.total == 0)
            data.list = []
        this.setState({ data: data, loading: false })
    }
    _getID = () => {
        return Math.random().toString().substr(3, 8)
    }
    newRow = () => {
        const { data } = this.state
        const { columns } = this.state.table
        var row = { isNew: true }
        columns.map(col => {
            row[col.dataIndex] = null
        })
        row.editable = true
        row.Id = moment().format('x')
        var rows = this.getCancelEditRows()
        var list = [row, ...rows]
        console.log(row)
        this.setState({ data: { list: list, total: list.length } })
    }
    removeRow = () => {
        const rows = this.state.table.rowSelection.selectedRowKeys
        if (rows.length == 0) return
        const list = [...this.state.data.list]
        rows.forEach((key) => {
            let index = list.findIndex(item => key == item.Id)
            let rm = list.splice(index, 1)[0]
            if (!rm.isNew) {
                this.RemoveList.push(rm)
            }
        })
        let rowSelection = Object.assign({}, this.state.table.rowSelection, { selectedRowKeys: [] })
        let table = Object.assign({}, this.state.table, { rowSelection: rowSelection })
        let data = Object.assign({}, this.state.data, { list: list, total: list.length })
        this.setState({ data: data, table: table })
        this.toolbar.setSelectDisabled(0)
    }
    getCancelEditRows = (editrowid) => {
        const rows = [...this.state.data.list]
        rows.forEach((r) => {
            if (editrowid != undefined) {
                if (r.Id == editrowid) {
                    if (r.editable == undefined)
                        r.editable = true
                    else
                        r.editable = !r.editable
                }
                else {
                    r.editable = false
                }
            }
            else {
                if (r.editable)
                    r.editable = false
            }
        })
        return rows
    }
    cancelEdit = (editrowid) => {
        const rows = this.getCancelEditRows(editrowid)
        this.setDataSource({ list: rows, total: rows.total })
    }
    getRows = () => {
        let list = [...this.state.data.list]
        list.forEach(item => {
            if (item.isNew) {
                item.Id = -1
                this.ForeignList.map((field) => {
                    item[field.oneObjecFiled] = undefined
                })
            }
        })
        let relist = [...this.RemoveList]
        relist.forEach(item => {
            item.Id = "-" + item.Id
            list.push(item)
        })
        this.cancelEdit()
        return list
    }

    onCommandClick = (cmd) => {
        if (cmd.command == "add") {
            this.newRow()
        }
        if (cmd.command == "remove") {
            this.removeRow()
        }
    }
    onRowClick = (row) => {
        this.clickRow = row
        if (this.props.onRowClick) {
            this.props.onRowClick(row, this)
        }
    }
    onRowDoubleClick = (row) => {
        this.cancelEdit(row.Id)
        if (this.props.onRowDoubleClick) {
            this.props.onRowDoubleClick(row, this)
        }

    }
    onRowSelect = (rows) => {
        this.selectRows = rows;
        if (this.props.onRowSelect) {
            this.props.onRowSelect(rows, this)
        }
    }

    //初始化开始
    UNSAFE_componentWillMount() {

    }


    //更新开始
    UNSAFE_componentWillUpdate() {

    }
    //更新完成
    componentDidUpdate() {

    }

    renderToolbar = () => {
        if (this.state.toolbar) {
            return (
                <Row gutter={[4, 4]}>
                    <Col span={24}>
                        <WayToolbar {...this.state.toolbar} parent={this} onSearch={(where) => {
                            console.log('wayedittable.onSerach', where)
                            this.onSearchClick(null, where)
                        }}>
                        </WayToolbar>
                    </Col>
                </Row>
            )
        }
    }
    render() {
        const { table, data } = this.state
        return (
            <>
                {this.renderToolbar()}
                <Row gutter={[4, 4]}>
                    <Col span={24}>
                        <Table
                            {...table}
                            dataSource={this.state.data.list}
                            loading={this.state.loading}
                            scroll={{ x: '100%', y: 600, scrollToFirstRowOnChange: true }}
                        >
                        </Table>
                    </Col>
                </Row>
            </>
        )
    }
    //初始化完成
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)
    }
}