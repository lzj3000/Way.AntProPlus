import React, { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'antd';
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
    var form: FormPlus = null
    useEffect(() => {
        props.init()
    }, [])
    useEffect(() => {
        if (props.result != undefined && !props.result?.success)
            error(props.result?.message)
    }, [props.result?.success])
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
    function error(err: string) {
        Modal.error({
            title: '出错了',
            content: err,
        });
    }

    const showTable = () => {
        return (<>
            <Row gutter={[16, 16]}><Col span={24}>
                <WayToolbar attrs={props.model?.commands} isselectrow={true} selectcount={selectCount}
                    commandShow={true}
                    helpShow={{ isset: true, ishelp: true }}
                    onClick={(name: string, command: CommandAttribute) => {
                        if (name == 'edit' || name == 'add') {
                            if (form != null) {
                                form.clear()
                            }
                            form.setTitle(props.title + "-" + command.text)
                            form.show()
                            if(name=='edit'){
                                form.setValues(values)
                            }
                        } else {
                            props.execute(command)
                        }
                    }}
                    searchShow={{
                        fields: props.model?.fields,
                        onSearch: (w: SearchWhere) => {
                            searchItem.whereList[w]
                            searchItem.page = 1
                            searchData()
                        }
                    }}
                ></WayToolbar></Col></Row>
            <Row gutter={[16, 16]}><Col span={24}>
                <WayTable attr={props.model} data={props.result?.result} isselect={true} isexpandable={true}
                    onSelectRows={(row, keys, selected) => {
                        setSelectCount(keys.length)
                        if (selected)
                            setValues(row)
                        else
                            setValues(null)
                    }}
                    onSearchData={(item) => {
                        searchItem.page = item.page
                        searchItem.size = item.size
                        searchItem.sortList = item.sortList
                        searchData()
                    }}
                ></WayTable></Col></Row>
        </>)
    }
    const showForm = (modal: boolean) => {
        return (
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <WayForm attr={props.model} title={props.title} ismodal={modal} onFinish={setValues} onInitFormed={(f) => { form = f }}></WayForm>
                </Col>
            </Row>
        )
    }
    return (<PageHeaderWrapper title={props.title}>
        {showTable()}
        {showForm(true)}
    </PageHeaderWrapper>)
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
        search(searchItem: SearchItem) { dispatch(search({ c: ownProps.controller, item: searchItem })) },
        execute(command: string, item: any) { dispatch(execute({ c: ownProps.controller, command: command, item: item })) },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WayPage);