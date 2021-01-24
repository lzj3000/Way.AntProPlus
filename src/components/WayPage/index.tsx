import React, { useEffect, useState } from 'react';
import { Alert, Col, message, Modal, Row } from 'antd';
import { connect } from 'react-redux'
import WayToolbar from '../WayToolbar'
import WayTable from '../WayTable'
import WayForm, { FormPlus } from '../WayForm'
import { ChildModelAttribute, CommandAttribute, ModelAttribute, SearchItem, SearchWhere, TableData } from '../Attribute';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { CloseCircleOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { PageLoading } from '@ant-design/pro-layout';
import ImportForm from '../WayTable/importform';
import { pageExportExcel } from '../WayTable/exportform';

interface WayPageProps {
    namespace?: string
    controller: string
    title?: string
    onCommandClick?: (command: string) => void,
    onExpandedRowTabPane?: (childmodel: ChildModelAttribute, record: any) => JSX.Element
}
const WayPage: React.FC<WayPageProps> = (props) => {
    const [loading, setLoading] = useState(false)
    const [values, setValues] = useState(null)
    const [selectCount, setSelectCount] = useState(0)
    const [keys, setKeys] = useState([])
    const [model, setModel] = useState<ModelAttribute | undefined>(undefined)
    const [data, setData] = useState({ rows: [], total: 0 })
    const [importShow, setImportShow] = useState(false)
    const [form, setForm] = useState<FormPlus>(null)
    const [searchItem, setSearchItem] = useState<SearchItem>({
        page: 1,
        size: 10,
        whereList: [],
        sortList: []
    })
    const [current, setCurrent] = useState(1)
    useEffect(() => {
        setModel(undefined)
        setValues(null)
        setSelectCount(0)
        setKeys([])
        setData({ rows: [], total: 0 })
        init()
    }, [props.controller])

    if (model == undefined) { return (<></>) }

    function init() {
        console.log('waypage.init')
        props.init().then((result) => {
            if (result.success) {
                setModel(result.data.model)
                searchDataThan({}, (data) => {
                    setData(data)
                })
            } else {
                resultMessage(result.message)
            }
        })
    }
    function searchDataThan(item: SearchItem, callback: (data: TableData) => void) {
        console.log(item)
        if (item.foreign == undefined && item.childmodel == undefined)
            setSelectCount(0)
        props.search(item).then(result => {
            //console.log(result)
            setLoading(false)
            if (result != undefined && result.success) {
                if (result.data.rows == null)
                    result.data.rows = []
                if (callback)
                    callback(result.data)
                else {
                    setData(result.data)
                }
            } else {
                resultMessage(result.message)
            }
        })
    }



    const executeCommand = (command: CommandAttribute) => {
        var item = null
        if (command.isselectrow)
            item = values
        if (command.selectmultiple)
            item = keys
        executeCommandData(command, item)
    }
    const executeCommandData = (command: CommandAttribute, values: any) => {
        props.execute(command.command, values).then((result) => {
            if (result != undefined && result.success) {
                message.success(command.name + "完成");
                if (form) {
                    form.hide()
                }
                searchDataThan(searchItem, (data) => {
                    setData(data)
                })
            } else {
                resultMessage(result.message)
            }
        })
    }

    function resultMessage(message: string) {
        Modal.error({
            visible: true,
            title: '出错了',
            icon: <CloseCircleOutlined />,
            content: <div>{message}</div>
        })
    }
    function renderToolbar() {
        return (<WayToolbar attrs={model?.commands} isselectrow={true} selectcount={selectCount}
            commandShow={true}
            onClick={(name: string, command: CommandAttribute) => {
                console.log(name)
                if (name == 'ImportData') {
                    setImportShow(true)
                    return;
                }
                if (name == 'ExportData') {
                    pageExportExcel(model, data.total, searchItem, props.search, props.title + ".xlsx")
                    return;
                }
                if (name == 'edit' || name == 'add') {
                    if (form != null) {
                        form.clear()
                    }
                    form.setHideSearch(true)
                    form.setTitle(props.title + "-" + command.name)
                    form.show()
                    if (name == 'edit') {
                        form.setValues(values)
                        form.setHideSearch(false)
                    }
                    form.onFinish = (values) => {
                        console.log(values)
                        executeCommandData(command, values)
                    }
                } else {
                    executeCommand(command)
                }
            }}
            searchShow={{
                fields: model?.fields?.filter(f => f.issearch ?? true),
                onSearch: (w: SearchWhere) => {
                    setLoading(true)
                    var item = { page: 1, whereList: [] }
                    if (w != undefined) {
                        if (isArray(w)) {
                            item.whereList = w
                        } else {
                            item.whereList = [w]
                        }
                    }
                    setSearchItem(item)
                    setCurrent(1)
                    searchDataThan(item, (data) => {
                        setData(data)
                    })
                },
                onSearchData: searchDataThan
            }}
        ></WayToolbar>)
    }
    function renderTable() {
        return (
            <WayTable attr={model} data={data} isselect={true} isexpandable={true} loading={loading} current={current}
                onSelectRows={(row, keys, selected) => {
                    setKeys(keys)
                    setSelectCount(keys.length)
                    setValues(row)
                }}
                onSearchData={(item, callback) => {
                    if (item.parent && item.childmodel) {//子表查询
                        searchDataThan(item, (data) => {
                            callback(data)
                        })
                        return
                    }
                    setLoading(true)
                    setCurrent(item.page)
                    item.whereList = searchItem.whereList
                    searchDataThan(item, (data) => {
                        setData(data)
                    })
                }}
                onExpandedRowTabPane={props.onExpandedRowTabPane}
            ></WayTable>)
    }
    function renderForm() {
        return (
            <WayForm attr={model} title={props.title} ismodal={true} onInitFormed={(f) => { setForm(f) }}
                onSearchData={searchDataThan}
            ></WayForm>
        )
    }
    function render() {
        return (<PageHeaderWrapper title={props.title}>
            <Row gutter={[16, 16]}><Col span={24}>{renderToolbar()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderTable()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderForm()}</Col></Row>
            <ImportForm title={props.title} isShow={importShow} attr={model} onAdd={props.execute} form={form}
                onShowChange={(show)=>{
                    setImportShow(show)
                    if(!show){
                        searchDataThan(searchItem)
                    }
                }}
                onSearchData={searchDataThan}
            ></ImportForm>
        </PageHeaderWrapper>)
    }
    return (render())
}

function mapDispatchToProps(dispatch: any, ownProps: WayPageProps) {
    var typens = 'waydefault'
    if (ownProps.namespace != undefined)
        typens = ownProps.namespace
    const init = (args: any) => {
        return {
            type: typens + '/init',
            payload: args,
        }
    }
    const search = (args: any) => {
        return {
            type: typens + '/search',
            payload: args,
        }
    }
    const execute = (args: any) => {
        return {
            type: typens + '/execute',
            payload: args,
        }
    }
    return {
        dispatch,
        init() {
            return dispatch(init(ownProps.controller))
        },
        search(searchItem: SearchItem) {
            return dispatch(search({ c: ownProps.controller, item: searchItem }))
        },
        execute(command: string, item: any) {
            return dispatch(execute({ c: ownProps.controller, command: command, item: item }))
        },
    }
}
export default connect(() => { }, mapDispatchToProps)(WayPage);