
import React, { useState } from 'react';
import { Row, Col, Space, Menu, Divider, Card } from 'antd'
import Icon, { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, PrinterOutlined, QuestionOutlined, InfoOutlined, SettingOutlined, ExclamationCircleOutlined, SearchOutlined, RollbackOutlined, ClearOutlined, SaveOutlined, FastForwardFilled, WhatsAppOutlined } from '@ant-design/icons';
import WayButton from './waybutton'
import WayProSearch, { WayProSearchProps } from './wayprosearch'
import { CommandAttribute } from '../Attribute';




export interface WayToolbarProps {
    attrs?: CommandAttribute[]
    searchShow?: false | WayProSearchProps,
    commandShow?: boolean,
    helpShow?: false | WayHelpProps,
    viewOredit?: string | 'view' | 'edit',
    iscircle?: boolean,
    isselectrow?: boolean,
    selectcount?: number,
    isclosecard?: boolean,
    onClick?: (name: string, command: CommandAttribute) => void,
    onCommandDisabled?: (command: CommandAttribute) => boolean,
}
interface WayHelpProps {
    isprint?: boolean,
    isset?: boolean,
    ishelp?: boolean,
    isabout?: boolean,
    wvh?: DefultViewHelp
}
class DefultViewHelp {
    printText: string = "打印"
    setText: string = "设置"
    helpText: string = "帮助"
    aboutText: string = "关于"
    onPrint(name: string): void {

    }
    onSet(name: string): void {

    }
    onHelp(name: string): void {

    }
    onAbout(name: string): void {

    }
}
const WayToolbar: React.FC<WayToolbarProps> = (props) => {
    var primaryKeys = ['add', 'create']
    var dangerKeys = ['remove', 'delete']
    var editKeys = ['update', 'edit']
    function initcommands() {
        var mianButtons: CommandAttribute[] = []
        var splitButtons: Map<string, CommandAttribute[]> = new Map()
        props.attrs?.forEach((attr) => {
            if (attr.issplit && attr.splitname != undefined) {
                if (splitButtons.has(attr.splitname)) {
                    var items = splitButtons.get(attr.splitname)
                    items?.push(attr)
                } else {
                    splitButtons.set(attr.splitname, [attr])
                }
            } else {
                mianButtons.push(attr)
            }
        })
        return (<Space wrap>{
            mianButtons.map((attr) => {
                if (splitButtons.has(attr.command)) {
                    const menu = (
                        <Menu>
                            {
                                splitButtons.get(attr.command)?.map((sattr, i) => {
                                    return (<Menu.Item key={i}><WayButton {...attrToButtonProps(sattr)} onClick={() => onClick(sattr.command, sattr)} toolbar={props}></WayButton></Menu.Item>)
                                })
                            }
                        </Menu>
                    );
                    return (
                        <WayButton {...attrToButtonProps(attr)} icon={<DownOutlined />} ismenu={true} menu={menu} onClick={() => onClick(attr.command, attr)} toolbar={props}></WayButton>
                    )
                } else {
                    return <WayButton {...attrToButtonProps(attr)} onClick={() => onClick(attr.command, attr)} toolbar={props}></WayButton>
                }
            })}
        </Space>)
    }
    function getseletrowdisabled(attr: CommandAttribute) {
        if (!props.isselectrow) return false
        if (props.onCommandDisabled != undefined)
            return props.onCommandDisabled(attr)
        if (props.selectcount == 1 && attr.isselectrow)
            return false
        if (props.selectcount != undefined && props.selectcount > 1 && attr.isselectrow && attr.selectmultiple)
            return false
        return attr.isselectrow
    }
    function inithelps() {
        if (props.helpShow != undefined && props.helpShow != false) {
            const [whp, setWhp] = useState({
                isprint: props.helpShow?.isprint ?? false,
                isset: props.helpShow?.isset ?? false,
                ishelp: props.helpShow?.ishelp ?? false,
                isabout: props.helpShow?.isabout ?? false,
                wvh: props.helpShow?.wvh ?? new DefultViewHelp()
            })
            return (<Space size={0} wrap>{showhelp(whp)}</Space>)
        }
    }
    function showhelp(whp: WayHelpProps) {
        var items = []
        if (whp.isprint) {
            items.push(<Divider type="vertical" />)
            items.push(<WayButton title={whp.wvh?.printText} name={'print'} shape={'circle'} icon={<PrinterOutlined />} onClick={onClick} ></WayButton>)
        }
        if (whp.isset) {
            items.push(<Divider type="vertical" />)
            items.push(<WayButton title={whp.wvh?.setText} name={'set'} shape={'circle'} icon={<SettingOutlined />} onClick={onClick}></WayButton>)
        }
        if (whp.ishelp) {
            items.push(<Divider type="vertical" />)
            items.push(<WayButton title={whp.wvh?.helpText} name={'help'} shape={'circle'} icon={<QuestionOutlined />} onClick={onClick}></WayButton>)
        }
        if (whp.isabout) {
            items.push(<Divider type="vertical" />)
            items.push(<WayButton title={whp.wvh?.aboutText} name={'about'} shape={'circle'} icon={<InfoOutlined />} onClick={onClick} ></WayButton>)
        }
        return (
            items.map((h) => { return h })
        )
    }
    function initsearch() {
        if (props.searchShow != undefined && props.searchShow != false) {
            return (<WayProSearch onSearch={props.searchShow.onSearch} fields={props.searchShow.fields}></WayProSearch>)
        }
    }
    const onClick = (name: any, command: CommandAttribute) => {
        if (props.onClick != undefined)
            props.onClick(name, command)
    }
    function attrToButtonProps(attr: CommandAttribute) {
        var prop = {
            name: attr.command,
            title: attr.title,
            text: attr.name,
            danger: false,
            block: false,
            type: "default",
            size: "default",
            shape: '',
            loading: false,
            icon: '',
            ghost: false,
            disabled: false
        }
        prop.disabled = getseletrowdisabled(attr)
        prop = setTypeAndIcon(prop)
        if (props.iscircle) {
            prop.shape = 'circle'
            prop.title = prop.text
            prop.text = ""
        }
        return prop
    }
    function setTypeAndIcon(prop: any) {
        if (primaryKeys.includes(prop.name)) {
            prop.type = 'primary'
            prop.icon = <Icon component={PlusOutlined}></Icon>
        }
        if (dangerKeys.includes(prop.name)) {
            prop.type = 'danger'
            prop.icon = <DeleteOutlined />
        }
        if (editKeys.includes(prop.name)) {
            prop.icon = <EditOutlined />
        }
        if (prop.icon == "") {
            prop.icon = <SyncOutlined />
        }
        return prop
    }
    var itmes = []
    if (props.commandShow != undefined && props.commandShow != false) {
        itmes.push(<Row justify="start"><Col>{initcommands()}</Col></Row>)
    }
    if (props.searchShow != undefined && props.searchShow != false) {
        itmes.push(<Row justify="end"><Col>{initsearch()}</Col></Row>)
    }
    if (props.helpShow != undefined && props.helpShow != false) {
        itmes.push(<Row justify="end"><Col>{inithelps()}</Col></Row>)
    }
    if (itmes.length == 3) {
        if (props.isclosecard) {
            return (<Row gutter={[8, 8]}>
                <Col span={12}>{itmes[0]}</Col>
                <Col span={10}>{itmes[1]}</Col>
                <Col span={2} >{itmes[2]}</Col>
            </Row>)
        }
        return (<Card><Row gutter={[8, 8]}>
            <Col span={12}>{itmes[0]}</Col>
            <Col span={10}>{itmes[1]}</Col>
            <Col span={2} >{itmes[2]}</Col>
        </Row></Card>)
    }
    if (itmes.length == 2) {
        if (props.isclosecard) {
            return (<Row gutter={[8, 8]}>
                <Col span={12}>{itmes[0]}</Col>
                <Col span={12}>{itmes[1]}</Col>
            </Row>)
        }
        return (<Card><Row gutter={[8, 8]}>
            <Col span={12}>{itmes[0]}</Col>
            <Col span={12}>{itmes[1]}</Col>
        </Row></Card>)
    }
    if (itmes.length == 1) {
        if (props.isclosecard) {
            return (<Row gutter={[8, 8]}><Col span={24}>{itmes[0]}</Col></Row>)
        }
        return (<Card><Row gutter={[8, 8]}><Col span={24}>{itmes[0]}</Col></Row></Card>)
    }
    return (<></>)
}


export default WayToolbar;