import React, { useEffect, useState } from 'react';
import { Alert, Col, Modal, Row } from 'antd';
import { connect } from 'react-redux'
import WayToolbar from '../WayToolbar'
import WayTable from '../WayTable'
import WayForm, { FormPlus } from '../WayForm'
import { CommandAttribute, ModelAttribute, ResultData, SearchItem, SearchWhere } from '../Attribute';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

interface WayPageProps {
    namespace?: string
    controller: string
    title?: string
    model?: ModelAttribute
    result?: ResultData
    onCommandClick?: (command: string) => void
}
const WayPage: React.FC<WayPageProps> = (props) => {
    const [values, setValues] = useState(null)
    const [selectCount, setSelectCount] = useState(0)
    const [model, setModel] = useState(null)

    const [errmessage, setErrMessage] = useState({
        iserr: false,
        message: ''
    })
    var form: FormPlus = null
    useEffect(() => {
        setModel(null)
        props.init()
    }, [])
    useEffect(() => {
        if (props.result != undefined && props.result.success != true)
            setErrMessage({ iserr: !props.result?.success, message: props.result?.message })
    }, [props.result])
    useEffect(() => {
        setModel(props.model)
    }, [props.model])
    if (props.model == null) { return (<></>) }
    var searchItem: SearchItem = {
        page: 1,
        size: 10,
        whereList: [],
        sortList: [],
    }
    function searchData() {
        props.search(searchItem)
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
                } else {
                    props.execute(command)
                }
            }}
            searchShow={{
                fields: model?.fields,
                onSearch: (w: SearchWhere) => {
                    searchItem.whereList[w]
                    searchItem.page = 1
                    searchData()
                }
            }}
        ></WayToolbar>)
    }
    function renderTable() {
        return (
            <WayTable attr={model} data={props.result?.result} isselect={true} isexpandable={true}
                onSelectRows={(row, keys, selected) => {
                    setSelectCount(keys.length)
                    if (selected)
                        setValues(row)
                    else {
                        if (keys.length == 1) {
                            var r = props.result?.result.rows.find(r => r.id == keys[0])
                            setValues(r)
                        } else
                            setValues(null)
                    }
                }}
                onSearchData={(item, callback) => {
                    props.search(item).then(result => {
                        if (result != undefined && result.success) {
                            var data = result.result.data ?? {}
                            if (!data.rows)
                                data.rows = []
                            if (!data.total)
                                data.total = 0
                            callback(data)
                        }
                    })
                }}
            ></WayTable>)
    }
    function renderForm() {
        return (
            <WayForm attr={model} title={props.title} ismodal={true} onFinish={setValues} onInitFormed={(f) => { form = f }}
                onSearchData={(item, callback) => {
                    props.search(item).then(result => {
                        if (result != undefined && result.success) {
                            var data = result.result.data ?? {}
                            if (result.result.model)
                                data.model = result.result.model
                            if (!data.rows)
                                data.rows = []
                            if (!data.total)
                                data.total = 0
                            callback(data)
                        }
                    })
                }}
            ></WayForm>
        )
    }
    function render() {
        return (<PageHeaderWrapper title={props.title}>
            <Row gutter={[16, 16]}><Col span={24}>{renderToolbar()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderTable()}</Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>{renderForm()}</Col></Row>
            <Modal visible={errmessage.iserr} onOk={() => { setErrMessage({ iserr: false }) }} onCancel={() => { setErrMessage({ iserr: false }) }}><Alert
                message="错误"
                description={errmessage.message}
                type="error"
                showIcon
            /></Modal>
        </PageHeaderWrapper>)
    }
    return (render())
}
function mapStateToProps(state: any, ownProps: WayPageProps) {
    let innerState = state.waydefault
    if (ownProps.namespace != undefined)
        innerState = state[ownProps.namespace]
    var mstp = { model: innerState.model, result: innerState.result, title: ownProps.title }
    if (mstp.title == undefined && mstp.model != null) {
        mstp.title = mstp.model.title
    }
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
        init() { dispatch(init(ownProps.controller)) },
        search(searchItem: SearchItem) {
            return dispatch(search({ c: ownProps.controller, item: searchItem }))
        },
        execute(command: string, item: any) {
            return dispatch(execute({ c: ownProps.controller, command: command, item: item }))
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WayPage);