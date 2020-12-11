import React from 'react';
import { InfoCircleOutlined, DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Select, Tooltip, Layout, Modal, Row, Col, Form, Card, Tabs, Table, Radio, Input, Divider } from 'antd';
import WayForm from './wayform';
import WayEditTable from './wayedittable'
import WayToolbar from './waytoolbar'

const { TabPane } = Tabs
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

const searchData = {
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

export default class WayFormTable extends React.Component {
    search = {}
    controller = ''
    row = null
    form = null
    childtables = []
    toolbar = null
    constructor(props) {
        super(props)
        this.state = {
            type: 'add',//add||edit||view
            command: { name: '新增', command: 'Create' },
            toolbar: null,
            form: {
                gridnum: 3,
                fields: [],
                title: '',
                model: false
            },
            panes: []
        }
        this._propsToState(props)
    }
    _propsToState = (props) => {
        if (props.command)
            this.state.command = props.command
        if (props.type)
            this.state.type = props.type
        this.state.toolbar = this._initToolbar(props)
        if (props.modelview) {
            this.state.form = this._initForm(props.modelview)
            this.state.panes = this._initPanes(props.modelview)
        }
        if (props.form != undefined) {
            if (props.form === false)
                this.state.form = false
            else {
                for (var n in this.state.form) {
                    if (props.form[n])
                        this.state.form = props.form[n]
                }
            }
        }
        this._defaultDisplay(props)
    }
    _defaultDisplay = (props) => {
        const { toolbar } = this.state
        switch (this.state.type) {
            case 'add'||'edit':
                toolbar.clear = { text: '重置', disabled: false }
                toolbar.onClear = this.onClear
                break
            case 'view':
                toolbar.clear = { disabled: true, text: '取消' }
                toolbar.ok = { disabled: true, text: '保存' }
                toolbar.commands = props.commands
                toolbar.onClick = props.onCommandClick
                toolbar.onClear = props.onClear
                this.state.form.command = null
                break
        }
    }
    _initToolbar = (props) => {
        var toolbar = {
            isok: true, 
            isclear: true,
            onSubmit: this.onSubmit,
            onRef: (ref) => {
                this.toolbar = ref
            }
        }
        return toolbar
    }
    _initForm = (view) => {
        var form = {
            fields: view.childitem,
            title: this.props.title,
            gridnum: 3,
            command: this.state.command,
            onRef: (ref) => {
                this.onFormRef(ref)
            },
            onFieldChange: (obj, form) => {

            },
            onFormSubmit: (data, form) => {
                form.cmd = this.state.command
                data = this.getObj()
                this.props.onFormSubmit(data, form)

            },
            onFormClear: (form) => {
                form.clear()
            },
            onSearch: (value, textbox, fn, form) => {
                this.onSearch(value, textbox, fn, form)
            }
        }
        form.parent = this

        switch (this.state.type) {

        }

        return form
    }
    _initPanes = (view) => {
        var panes = []
        for (var i in view.childmodel) {
            var cm = view.childmodel[i]
            var pane = {
                key: i,
                title: cm.title == null ? cm.tablename : cm.title,
                buttons: [],
                parent: this,
                name: cm.propertyname,
                type: cm.name,
                table: {
                    fields: cm.childitem,
                    ischeck: cm.ischeck,
                    onSearchClick: (item, table) => {
                        console.log('wayformtable.onSearchClick', table)
                        item.detailname = table.props.parent.name
                        if (this.row != null)
                            item.findId = this.row.Id
                        this.onSearch(item, null, (res) => {
                            table.setDataSource({ list: res.result.list, total: res.result.total })
                        })
                    },
                    onFieldSearch:(searchItem, textbox, callback,table)=>{
                        searchItem.detailname = table.props.parent.name
                        console.log('WayFormTable.onFieldSearch')
                        this.onSearch(searchItem, textbox, callback)
                    },
                    onRef: (ref) => { this.onTableRef(pane, ref) }
                }
            }
            if (!cm.disabled) {
                if (cm.isselect)
                    pane.buttons.push({ name: '选择', command: 'select', icon: <SelectOutlined />, disabled: false })
                if (cm.isadd)
                    pane.buttons.push({ name: '新增', isselectrow: false, command: 'add', type: 'primary', icon: <PlusOutlined />, disabled: false })
                if (cm.isedit)
                    pane.buttons.push({ name: '修改', isselectrow: true, command: 'edit', icon: <EditOutlined />, disabled: true })
                if (cm.isremove)
                    pane.buttons.push({ name: '删除', isselectrow: true, isselectmultiple: true, command: 'remove', type: "primary", danger: true, icon: <DeleteOutlined />, disabled: true })
            }
            var tool = { commands: pane.buttons, search: false }
            if (this.state.command.command != 'Create')
                tool.search = true
            pane.table.toolbar = tool
            pane.table.parent = pane
            panes.push(pane)
        }
        return panes
    }

    getObj = () => {
        var row = this.form.getObj()
        this.childtables.map((pane) => {
            row[pane.name] = pane.table.getRows()
        })
        return row
    }
    setObj = (row) => {
        this.row = row
        if (this.form)
            this.form.setObj(row)
        this.childtables.map((pane) => {
            if (row && row[pane.name]) {
                let list = row[pane.name]
                if (list && list.length > 0) {
                    pane.table.setDataSource(list)
                    return
                }
            }
            pane.table.reload()
        })
    }
    onSubmit = (item, callback) => {
        var data = this.getObj()
        if (this.props.onFormSubmit)
            this.props.onFormSubmit(data, this.form, callback)
    }
    onClear = () => {
        if (this.form)
            this.form.clear()
    }
    clear = () => {
        if (this.form)
            this.form.clear()
        this.childtables.map((pane) => {
            pane.table.setDataSource({ list: [], total: 0 })
        })
    }
    setDataSource = (name, data) => {
        for (var i in this.childtables) {
            var pane = this.childtables[i]
            if (pane.name == name) {
                pane.table.setDataSource(data)
                break
            }
        }
    }
    onSearch = (item, textbox, callback, event) => {
        console.log(item)
        if (this.props.onSearch)
            this.props.onSearch(item, textbox, callback, event)
    }
    onFormRef = (form) => {
        this.form = form
    }
    onTableRef = (pane, table) => {
        this.childtables.push({ name: pane.name, table: table })
    }
    show = (command) => {
        this.setState({ command: command })
    }

    renderTabs = () => {
        return (
            <Tabs>
                {this.state.panes.map(pane => (
                    <TabPane tab={pane.title} key={pane.key}>
                        <WayEditTable {...pane.table} ></WayEditTable>
                    </TabPane>
                ))}
            </Tabs>
        )
    }
    render() {
        if (!this.state.form) {
            return this.renderTabs()
        }
        else {
            const { fields } = this.state.form
            if (fields.length == 0) return <></>
            return (
                <Form layout="vertical" >
                    <WayForm {...this.state.form} extra={<WayToolbar {...this.state.toolbar}></WayToolbar>}></WayForm>
                    <Card >
                        {this.renderTabs()}
                    </Card>
                </Form >
            )
        }
    }
    //组件挂载完成时候触发的生命周期函数04
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)

    }
}