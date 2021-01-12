import React, { useEffect, useState } from 'react';
import { Alert, Col, Modal, Row } from 'antd';
import { connect } from 'react-redux'
import WayToolbar from '../WayToolbar'
import WayTable from '../WayTable'
import WayForm, { FormPlus } from '../WayForm'
import { ChildModelAttribute, CommandAttribute, ModelAttribute, SearchItem, SearchWhere, TableData } from '../Attribute';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { CloseCircleOutlined } from '@ant-design/icons';

interface WayPageProps {
    namespace?: string
    controller: string
    title?: string
    onCommandClick?: (command: string) => void,
    onExpandedRowTabPane?: (childmodel: ChildModelAttribute, record: any) => JSX.Element
}
const WayPage: React.FC<WayPageProps> = (props) => {
    const [values, setValues] = useState(null)
    const [selectCount, setSelectCount] = useState(0)
    const [keys, setKeys] = useState([])
    const [model, setModel] = useState<ModelAttribute | undefined>(undefined)
    const [data, setData] = useState({ rows: [], total: 0 })
    var form: FormPlus = null

    useEffect(() => {
        init()
    }, [])
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
        props.init().then((result) => {
            if (result.success) {
                setModel(result.data.model)
                // searchDataThan(searchItem,(data)=>{
                //     setData(data)
                // })
            } else {
                resultMessage(result.message)
            }
        })
    }
    function searchDataThan(item: SearchItem, callback: (data: TableData) => void) {
        props.search(item).then(result => {
            if (result != undefined && result.success) {
                if (result.data.rows == null)
                    result.data.rows = []
                callback(result.data)
            } else {
                resultMessage(result.message)
            }
        })
    }

    var searchItem: SearchItem = {
        page: 1,
        size: 10,
        whereList: [],
        sortList: [],
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
                searchDataThan(searchItem, (data) => { setData(data) })
            } else {
                resultMessage(result.message)
            }
        })
    }

    const resultMessage = (message: string) => {
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
                    if (w != undefined)
                        searchItem.whereList = [w]
                    searchItem.page = 1
                    searchDataThan(searchItem, (data) => {
                        setData(data)
                    })
                },
                onSearchData: searchDataThan
            }}
        ></WayToolbar>)
    }
    function renderTable() {
        return (
            <WayTable attr={model} data={data} isselect={true} isexpandable={true}
                onSelectRows={(row, keys, selected) => {
                    setKeys(keys)
                    setSelectCount(keys.length)
                    setValues(row)
                }}
                onSearchData={(item,callback) => {
                    if (item.parent && item.childmodel){
                        searchDataThan(item, (data) => {
                            callback(data)
                        })
                        return
                    }
                    item.whereList=searchItem.whereList
                    searchDataThan(item, (data) => {
                        setData(data)
                    })
                }}
                onExpandedRowTabPane={props.onExpandedRowTabPane}
            ></WayTable>)
    }
    function renderForm() {
        return (
            <WayForm attr={model} title={props.title} ismodal={true} onInitFormed={(f) => { form = f }}
                onSearchData={searchDataThan}
            ></WayForm>
        )
    }
    function render() {
        return (<PageHeaderWrapper title={props.title}>
            <Row gutter={[16, 16]}><Col span={24}>{renderToolbar()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderTable()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderForm()}</Col></Row>
        </PageHeaderWrapper>)
    }
    return (render())
}
function mapStateToProps(state: any, ownProps: WayPageProps) {
    let innerState = state.waydefault
    if (ownProps.namespace != undefined)
        innerState = state[ownProps.namespace]
    var mstp = { result: innerState.result, title: ownProps.title }
    return mstp
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
export default connect(mapStateToProps, mapDispatchToProps)(WayPage);