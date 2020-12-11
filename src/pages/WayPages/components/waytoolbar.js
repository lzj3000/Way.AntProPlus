import React from 'react';
import { Button, Divider, Dropdown, Menu, message, Tooltip, Row, Col, Space, Input, Cascader, Modal } from 'antd';
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, ExclamationCircleOutlined, SearchOutlined, RollbackOutlined, ClearOutlined, SaveOutlined, FastForwardFilled } from '@ant-design/icons';
import WayTextBox from './waytext'

const { confirm } = Modal;
const command = {
    command: "",
    name: "",
    title: "",
    isselectrow: true,
    isalert: true,
    editshow: true,
    issplit: false,
    splitname: null,
    disabled: false,
    visible: true,
    onclick: null,
    icon: null
}

export default class WayToolbar extends React.Component {
    commands = []
    buttons = []
    splitbuttons = []
    constructor(props) {
        super(props)
        this.state = {
            type: 'page',//page,form,table
            divider: false,
            search: false,
            buttons: [],
            ok: {
                disabled: false,
                text: '确定',
                icon: <SaveOutlined />,
                type: 'primary',
                loading: false,
                onClick: (event) => {
                    this.onSubmitClick(event)
                }
            },
            clear: {
                disabled: false,
                text: '取消',
                icon: <ClearOutlined />,
                onClick: (event) => {
                    this.onClearClick(event)
                }
            }
        }
        this._propsTostate(props)
        console.log('waytoolbar.init', this)
    }
    _propsTostate = (props) => {
        for (var n in this.state) {
            if (props[n]) {
                if (typeof this.state[n] == 'object') {
                    var obj = Object.assign({}, this.state[n])
                    var po = props[n]
                    for (var o in obj) {
                        if (po[o])
                            obj[o] = po[o]
                    }
                    this.state[n] = obj
                }
                else {
                    this.state[n] = props[n]
                }
            }

        }
        this.commands = props.commands
        if (this.commands) {
            this.commands.map((cmd) => {
                let but = this._defaultDisplay(cmd)
                if (but != undefined) {
                    if (cmd.issplit) {
                        var sobj = this.splitbuttons.find((item) => { item.name == cmd.splitname })
                        if (!sobj) {
                            sobj = { name: cmd.splitname, buttons: [] }
                            this.splitbuttons.push(sobj)
                        }
                        sobj.buttons.push(but)
                    }
                    else {
                        this.state.buttons.push(but)
                    }
                }
            })
        }

    }
    _defaultDisplay = (command) => {
        if (command == undefined) return undefined
        let button = { command: command }
        if (this.state.type == 'page') {
            if (button.icon == null) {
                if (command.command.toLowerCase().startsWith('un'))
                    button.icon = <RollbackOutlined />
                else
                    button.icon = <SyncOutlined />
            }
            button.text = command.name
            button.title = command.title
            if (command.isselectrow)
                button.disabled = true
        }
        if (this.state.type == 'form') {
            if (!command.editshow) return undefined
            button.text = command.name
            button.title = command.title
        }
        if (this.state.type == 'table') {
            button.shape = 'circle'
            if (command.isselectrow)
                button.disabled = true
        }
        if (command.icon != null)
            button.icon = `<${command.icon}/>`
        return button
    }
    _toRenderState = (state) => {
        this.setState(state)
    }
    setAllDisabled = (disabled) => {
        this.buttons.forEach((button) => {
            button.setDisabled(disabled)
        })
        var ok = Object.assign({}, this.state.ok, { disabled: !disabled })
        var clear = Object.assign({}, this.state.clear, { disabled: !disabled })
        this.setState({ ok: ok, clear: clear })
    }
    setSelectDisabled = (selectCount) => {
        this.buttons.forEach((button) => {
            var cmd = button.command
            if (selectCount == 0) {
                button.setDisabled(cmd.isselectrow)
            }
            if (selectCount == 1) {
                if (cmd.isselectrow)
                    button.setDisabled(false)
            }
            if (selectCount > 1) {
                if (cmd.isselectrow) {
                    if (cmd.isselectmultiple)
                        button.setDisabled(false)
                    else
                        button.setDisabled(true)
                }
            }
        })
    }
    onFieldSearch = (searchItem, textbox, callback) => {
        console.log('WayToolbar.onFieldSearch')
        if (this.props.parent && this.props.parent.onFieldSearch)
            this.props.parent.onFieldSearch(searchItem, textbox, callback)
    }
    setOkDisabled = (disabled) => {
        var ok = Object.assign({}, this.state.ok, { disabled: disabled })
        this.setState({ ok: ok })
    }
    onSearchClick = (where, button) => {
        console.log('waytoolbar.onSearchClick', where)
        if (this.props.onSearch)
            this.props.onSearch(where, button)
    }
    setSearchVisible = (visible) => {
        this.setState({ search: visible })
    }

    onCommandClick = (command, button) => {
        if (this.props.parent && this.props.parent.onCommandClick) {
            this.props.parent.onCommandClick(command, button, this)
        }
        if (this.props.onClick) {
            this.props.onClick(command, button, this)
        }
    }
    onSubmitClick = (event) => {
        let ok = Object.assign({}, this.state.ok)
        ok.loading = { delay: 10 }
        if (this.props.onSubmit)
            this.props.onSubmit(ok, () => {
                this.closeSubmitLoading()
            })
        this.setState({ ok: ok })
    }
    closeSubmitLoading = () => {
        let ok = Object.assign({}, this.state.ok)
        ok.loading = false
        this.setState({ ok: ok })
    }
    onClearClick = (event) => {
        if (this.props.onClear)
            this.props.onClear()
    }
    onRef = (button) => {
        this.buttons.push(button)
    }

    renderButton = (but) => {
        const cb = this.splitbuttons.find((cb) => cb.name == but.command.command)
        if (cb) {
            const menu = (
                <Menu>
                    {cb.buttons.map((bts, i) => <Menu.Item key={i}><WayButton {...bts} parent={this}></WayButton></Menu.Item>)}
                </Menu>
            );
            return (
                <WayButton {...but} isdown={true} menu={menu} parent={this}></WayButton>
            )
        }
        else {
            return (
                <WayButton {...but} parent={this}></WayButton>
            )
        }
    }
    renderToolbar = (col) => {
        return (
            <Col span={col}><Row gutter={[8, 4]}>
                {this.state.buttons.map((but, index) => {
                    return (
                        <Col key={index}>
                            {(this.state.divider && index != 0) ? <Divider type="vertical" /> : ''}
                            {this.renderButton(but)}
                        </Col>
                    )
                })}
                {this.props.isclear ? <Col><Button {...this.state.clear}>{this.state.clear.text}</Button></Col> : ''}
                {this.props.isok ? <Col><Button {...this.state.ok}>{this.state.ok.text}</Button></Col> : ''}
            </Row></Col>
        )
    }
    renderSearch = () => {
        if (this.state.search) {
            return (
                <Col span={10} offset={2}>
                    <WayProSearch fields={this.props.fields} parent={this}></WayProSearch>
                </Col>
            )
        }
        else {
            return (<Col span={12} />)
        }
    }
    componentWillReceiveProps(nextProps) {
        //console.log(nextProps)
        if (nextProps.selectRows) {
            this.setSelectDisabled(nextProps.selectRows.length)
        }
    }
    render() {
        //console.log('toolbar.render')
        switch (this.state.type) {
            case 'page':
                return (<Row>{this.renderToolbar(24)}</Row>)
            case 'table':
                return (<Row>{this.renderToolbar(12)}{this.renderSearch()}</Row>)
            case 'form':
                if (this.state.search)
                    return (<Row>{this.renderToolbar(12)}{this.renderSearch()}</Row>)
                else
                    return (<Row>{this.renderToolbar(24)}</Row>)
        }
    }
    //初始化完成
    componentDidMount() {
        if (this.props.onRef)
            this.props.onRef(this)
    }
}

export class WayButton extends React.Component {
    command = {
        command: "",
        name: "",
        title: "",
        index: 0,
        icon: null,
        isselectrow: true,
        isalert: true,
        editshow: true,
        issplit: false,
        splitname: null,
        disabled: false,
        visible: true,
        onclick: null
    }
    constructor(props) {
        super(props)
        this.state = {
            disabled: false,
            ghost: false,
            href: null,
            htmlType: 'button',
            icon: null,
            loading: false,//boolean | { delay: number }
            shape: '',//circle、 round
            size: 'default',//large | middle | small
            target: null,
            type: null,//primary | ghost | dashed | danger | link | text
            block: false,
            danger: false,
            onClick: (event) => {
                this.onCommandClick(event)
            },
            text: '',
            title: ''
        }
        this._propsTostate(props)
    }
    _propsTostate = (props) => {
        this.command = props['command']
        for (var n in this.state) {
            if (props[n])
                this.state[n] = props[n]
        }
        if (this.command)
            this._defaultDisplay(this.command)
    }
    _defaultDisplay = (command) => {
        var name = command.command.toLowerCase()
        if (name == 'create' || name == 'add') {
            this.state.type = 'primary'
            this.state.icon = <PlusOutlined />
        }
        if (name == 'update' || name == 'edit')
            this.state.icon = <EditOutlined />
        if (name == 'remove' || name == 'delete') {
            this.state.type = 'danger'
            this.danger = true
            this.state.icon = <DeleteOutlined />
        }
    }
    _toRenderState = (state) => {
        this.setState(state)
    }
    setTextOrTitle = (text, title) => {
        if (name && title)
            this._toRenderState({ text: text, title: title })
        if (name && !title)
            this._toRenderState({ text: text })
        if (!name && title)
            this._toRenderState({ title: title })
    }
    setDisabled = (disabled) => {
        this._toRenderState({ disabled: disabled })
    }
    setLoading = (loading) => {
        if (loading != undefined)
            this._toRenderState({ loading: loading })
        else
            this._toRenderState({ loading: !this.state.loading })
    }
    setProp = (name, value) => {
        let state = {}
        if (state[name]) {
            state[name] = value
            this._toRenderState(state)
        }
    }
    onCommandClick = (event) => {
        if (this.command) {
            if (this.command.isalert) {
                const _this = this;
                confirm({
                    title: `您确认要进行${this.command.name}操作吗?`, icon: <ExclamationCircleOutlined />,
                    onOk() {
                        _this.onClick(event)
                        return;
                    },
                    onCancel() {
                        return;
                    },
                })
            }
            else {
                this.onClick(event)
            }
        }
    }
    onClick = (event) => {
        if (this.props.onClick) {
            this.props.onClick(event)
        }
        if (this.props.parent.onCommandClick) {
            this.props.parent.onCommandClick(this.command, this)
        }
    }
    render() {
        if (this.props.isdown) {
            return (
                <Dropdown overlay={this.props.menu}>
                    <Tooltip title={this.state.title}>
                        <Button {...this.state}>{this.state.text}<DownOutlined /></Button>
                    </Tooltip>
                </Dropdown>
            )
        }
        else {
            return (
                <Tooltip title={this.state.title}>
                    <Button {...this.state}>{this.state.text}</Button>
                </Tooltip>
            )
        }
    }
    //初始化完成
    componentDidMount() {
        if (this.props.parent) {
            if (this.props.parent.onRef)
                this.props.parent.onRef(this)
        }
        else {
            if (this.props.onRef)
                this.props.onRef(this)
        }
    }
}
export class WayProSearch extends React.Component {
    where = { name: '', symbol: '', value: '' }
    form = null
    textbox = null
    searchbutton = null
    constructor(props) {
        super(props)
        this.state = {
            type: 'table',//page,table
            cascader: null,
            box: null
        }
        this._propsTostate(props)
        this._defaultDisplay()
    }
    _propsTostate = (props) => {
        for (var n in this.state) {
            if (props[n])
                this.state[n] = props[n]
        }
        if (this.state.type == 'table') {
            const { fields } = props
            let options = [{ label: '全部', value: '*' }]
            fields.map((item) => {
                if (item.issearch && item.title != null) {
                    var sf = { label: item.title, value: item.field }
                    if (item.searchsymbol) {
                        sf.children = [...item.searchsymbol]
                    }
                    options.push(sf)
                }
            })
            var cascader = {
                options: options,
                onChange: (value, selectedOptions) => {
                    var name = value[0]
                    const { fields } = this.props
                    var box = fields.find((item) => item.field == name)
                    if (name != '*')
                        box.symbol = value[1]
                    this._toRenderState({ box: box })
                    if (this.textbox && name != this.textbox.state.field)
                        this.textbox.clear()
                }
            }
            this.state.cascader = cascader
        }
    }
    _defaultDisplay = () => {

    }
    _toRenderState = (state) => {
        this.setState(state)
    }
    onFieldSearch = (item, textbox, callback) => {
        console.log('WayProSearch.onFieldSearch')
        if (this.props.parent && this.props.parent.onFieldSearch)
            this.props.parent.onFieldSearch(item, textbox, callback)
    }
    onSearchClick = () => {
        if (this.state.type = 'table') {
            var box = this.state.box
            let w = null
            if (box) {
                w = { name: box.field, symbol: box.symbol, value: this.textbox.getValue() }
                // this.searchbutton.setLoading({ delay: 10 })
            }
            if (this.props.parent && this.props.parent.onSearchClick) {
                this.props.parent.onSearchClick(w, this)
            }
            if (this.props.onSearch)
                this.props.onSearch(w, this)
        }
    }
    onRefText = (text) => {
        this.textbox = text
    }
    onRefSearchButton = (button) => {
        this.searchbutton = button
    }

    render() {
        console.log('render')
        return (
            <Input.Group compact>
                <Cascader style={{ width: '35%' }} allowClear={false} {...this.state.cascader} defaultValue={['*']} />
                <WayTextBox
                    style={{ width: '50%' }}
                    search={true} field={'*'}
                    item={this.state.box}
                    onRef={this.onRefText}
                    parent={this}
                />
                <Button style={{ width: '15%' }} type={'primary'} icon={<SearchOutlined />} onClick={this.onSearchClick} onRef={this.onRefSearchButton}></Button>
            </Input.Group>
        )
    }

}
