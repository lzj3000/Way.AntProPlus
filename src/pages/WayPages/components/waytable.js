import React from 'react';
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable, { ProColumns, ProColumnsValueType, ActionType, } from '@ant-design/pro-table';
import { Button, Divider, Dropdown, Menu, message, Input, Modal, Form, Tooltip, Row } from 'antd';
import WayToolbar from './waytoolbar'
import WayTextBox from './waytext'
import WayFormTable from './wayformtable';


const { confirm } = Modal;
export default class WayTable extends React.Component {
    selectRows = null
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
            toolBars: [],
            table: {},
            data: {
                list: [],
                total: 0
            },
            loading: false
        }
        if (props.data != undefined && props.data != null)
            this.state.data = props.data
        this.initTable(props)
        console.log('waytable.constructor')
    }
    initTable = (props) => {
        var table = {
            tableLayout: 'fixed',
            rowKey: 'Id',
            headerTitle: '',
            search: true,
            columns: [],
            bordered: false,
            pagination: {
                pageSize: 10
            },
            rowSelection: {
                fixed: true,
                columnWidth: '60px',
                selections: true,
                selectedRowKeys: [],
                onChange: (selectedRowKeys, selectedRows) => {
                    if (this.selectRows == null && selectedRows.length == 0) return
                    this.onRowSelect(selectedRowKeys, selectedRows)
                }
            },
            onSubmit: (params) => {
                console.log(params)
                this.onSearchClick(params)
            },
            onRow: (record) => {
                return {
                    onClick: event => {
                        event.stopPropagation()
                        this.onRowClick(record, event)
                    },
                    onDoubleClick: event => {
                        console.log("table.onDoubleClick.row")
                        event.stopPropagation()
                        this.onRowDoubleClick(record, event)
                    },
                };
            },
            onChange: (pagination, filters, sorter) => {
                if (pagination) {
                    this.search.pageindex = pagination.current
                    this.search.pageSize = pagination.pageSize
                }
                if (sorter)
                    this.search.OrderbyList = [{ name: sorter.field, isdesc: sorter.order == 'descend' }]
                console.log(pagination)
                console.log(filters)
                console.log(sorter)

                this.reload()
            }
        }
        if (props.commands) {
            table.toolBarRender = (action, { selectedRows }) => [(<WayToolbar parent={this} onRef={this.onToolbarRef} commands={props.commands} />)]
        }
        else {
            table.toolBarRender = false
        }
        if (props.modelview) {
            if (props.modelview.childmodel && props.modelview.childmodel.length > 0) {
                table.expandable = {
                    rowExpandable: (record) => {
                        return true
                    },
                    expandedRowRender: (record) => {
                        return (
                            <WayFormTable
                                modelview={this.props.modelview}
                                form={false} toolbar={false}
                                onRef={(ref) => { ref.setObj(record) }}
                                onSearch={(item, textbox, callback, event) => { this.onFieldSearch(item, textbox, callback) }}
                            >
                            </WayFormTable>
                        )
                    },
                    onExpand: (expanded, record) => {
                        if (expanded)
                            this.rowSelect(record, true)
                    }
                }
            }
        }

        for (var n in table) {
            if (n === 'columns') continue;
            if (props[n])
                table[n] = props[n];
        }

        this.state.table = table;
        this.getColumns(props);

    }

    getColumns = (props) => {
        if (props.columns) {
            const { columns } = props;
            const { table } = this.state;
            for (var i in columns) {
                if (columns[i].visible)
                    table.columns[i] = this.getProColumn(columns[i]);
            }
            //初始化查询面板
            table.columns.map((item) => {
                var field = item.item
                if (field.issearch && !item.hideInSearch) {
                    item.renderFormItem = (item, config, form) => {
                        if (!item) return (<div />)
                        if (config.id) {
                            config.defaultRender = (newItem) => {
                                return (
                                    <WayTextBox item={newItem} search={true} parent={this}
                                        onChange={(oldv, newv, textbox) => {
                                            if (textbox.state.type == "Search")
                                                config.onChange(textbox.state.hidevalue)
                                            else
                                                config.onChange(newv)
                                        }}
                                    ></WayTextBox>
                                )
                            }
                        }
                        return config.defaultRender(field)
                    }
                }
            })
        }
    }
    getProColumn = (item) => {
        var type = this.getvalueType(item);
        var venum = this.getvalueEnum(item);
        var column = { align: 'center', textWrap: 'word-break', width: 150, sorter: true, ellipsis: true, title: item.title, dataIndex: item.field, valueEnum: venum, valueType: type, hideInSearch: false, hideInTable: false, hideInForm: false, item: item }
        if (item.title == "" || item.title == undefined) {
            column.hideInForm = true;
            column.hideInSearch = true;
            column.hideInTable = true;
        }
        if (item.foreign && item.foreign.isfkey) {
            column.renderText = (text, record, index) => {
                var obj = record[item.foreign.oneObjecFiled]
                if (obj) {
                    var vvv = obj[item.foreign.oneDisplayName]
                    return vvv
                }
                return text
            }
        }
        return column;
    }
    getvalueType = (item) => {
        switch (item.type) {
            case "datetime":
                return "date";
            case "int":
            case "int32":
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
    commandClick = (name) => {
        var command = this.props.commands.find((cmd) => cmd.command == name)
        if (command) {
            this.onCommandClick(command)
        }
    }
    onCommandClick = (command, button) => {
        if (command) {
            command.selectRows = this.selectRows
            if (this.props.onCommandClick) {
                this.props.onCommandClick(command, this)
            }
        }
    }
    onSearchClick = (params) => {
        this.search.pageindex = 1
        this.search.WhereList = []
        this.search.foreignfield = ''
        this.search.detailname = ''
        this.search.OrderbyList = []
        if (params != null) {
            for (var n in params) {
                if (Array.isArray(params[n])) {
                    this.search.WhereList.push({ name: n, symbol: '>=', value: params[n][0] })
                    this.search.WhereList.push({ name: n, symbol: '<=', value: params[n][1] })
                }
                else
                    this.search.WhereList.push({ name: n, value: params[n] })
            }
        }
        this.setState({ loading: true })
        if (this.props.onSearchClick) {
            this.props.onSearchClick(this.search, (res) => {
                this.setDataSource(res.result)
            }, this)
        }
    }
    reload = (row) => {
        this.search.pageindex = 1
        console.log(this.search)
        this.setState({ loading: true })
        if (this.props.onSearchClick) {
            this.props.onSearchClick(this.search, (res) => {
                this.setDataSource(res.result)
                if (row) {
                    this.rowSelect(row)
                }
            }, this)
        }
    }

    onFieldSearch = (item, textbox, callback) => {
        if (this.props.onSearchClick) {
            this.props.onSearchClick(item, callback)
        }
    }
    onRowClick = (row) => {
        this.rowSelect(row)
        if (this.props.onRowClick) {
            this.props.onRowClick(row, this)
        }
    }
    onRowDoubleClick = (row, event) => {
        console.log('table.onRowDoubleClick.this')
        if (this.props.onRowDoubleClick) {
            this.props.onRowDoubleClick(row, this)
        }
    }
    rowSelect = (row, only) => {
        if (only) {
            let keys = [row.Id]
            this.selectRows = [row]
            this.onRowSelect(keys, this.selectRows)
            return
        }
        let keys = Object.assign([], this.state.table.rowSelection.selectedRowKeys)
        let index = -1
        if (this.selectRows)
            index = this.selectRows.findIndex((r) => r.Id == row.Id)
        if (index >= 0) {
            this.selectRows.splice(index, 1)
            keys.splice(index, 1)
        }
        else {
            if (this.selectRows == null)
                this.selectRows = []
            this.selectRows.push(row)
            keys.push(row.Id)
        }
        this.onRowSelect(keys, this.selectRows)
    }
    onRowSelect = (keys, rows) => {
        this.selectRows = rows;
        let rowSelection = Object.assign({}, this.state.table.rowSelection, { selectedRowKeys: keys })
        let table = Object.assign({}, this.state.table, { rowSelection: rowSelection })
        this.setState({ table: table }, () => {
            if (this.toolbar)
                this.toolbar.setSelectDisabled(keys.length)
        })
        if (this.props.onRowSelect) {
            this.props.onRowSelect(rows, this)
        }
    }
    setDataSource = (data) => {
        console.log(data)
        if (data.total == 0)
            data.list = []
        this.setState({ data: data, loading: false })
    }
    //初始化开始
    UNSAFE_componentWillMount() {

    }

    //初始化完成
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)
    }
    //更新开始
    UNSAFE_componentWillUpdate() {

    }
    //更新完成
    componentDidUpdate() {

    }
    onToolbarRef = (toolbar) => {
        this.toolbar = toolbar
    }
    render() {
        const { table, data } = this.state
        return (
            <ProTable
                {...table}
                dataSource={data.list}
                loading={this.state.loading}
                scroll={{ x: '100%', y: 600, scrollToFirstRowOnChange: true }}
            >
            </ProTable>
        )
    }

}