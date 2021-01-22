import { Card, Col, Modal, Row } from "antd"
import React, { useEffect, useState } from "react"
import { ChildModelAttribute, CommandAttribute, SearchItem, SearchWhere, TableData, WayFieldAttribute } from "../Attribute"
import WayTable from "../WayTable"
import WayToolbar from "../WayToolbar"
import moment from 'moment';
import DragModal from "./window"
import { isArray } from "lodash"

interface WayEditTableProps {
    model?: ChildModelAttribute,
    data?: TableData,
    iscirclebutton?: boolean,
    closetoolbar?: boolean,
    closesearch?: boolean,
    closeedit?: boolean,
    commandShow?: boolean,
    ismodal?: boolean,
    modelshow?: boolean,
    isselect?: boolean,
    selectType?: string,
    closecard?: boolean,
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void
    onAddRowing?: (row: any) => boolean,
    onAdded?: (row: any) => void,
    onEditRowing?: (row: any, field: string, value: any) => boolean,
    onRemoveRowing?: (row: any) => boolean,
    onRemoveed?: (row: any) => void,
    onDataChange?: (data: TableData, row: any, changeType: string | 'add' | 'edit' | 'remove') => void,
    onGetCommands?: (commands: CommandAttribute[]) => CommandAttribute[],
    onCommandClicking?: (command: CommandAttribute) => void,
    onCommandClicked?: (command: CommandAttribute) => void,
    onModalChange?: (isshow: boolean, row: any) => void,
    onColumnToEdit?: (field: WayFieldAttribute, row: any) => JSX.Element
    onGetFieldToEdit?: (field: WayFieldAttribute, row: any) => WayFieldAttribute
}
const WayEditTable: React.FC<WayEditTableProps> = (props) => {
    const [selectKeys, setSelectKeys] = useState([])
    const [selectRow, setSelectRow] = useState(null)
    const [rowedit, setRowEdit] = useState(false)
    const [data, setData] = useState<TableData | undefined>(props.data)
    const [coms, setToolbar] = useState<CommandAttribute[]>(getcmds())
    const [comshow, setComShow] = useState(props.commandShow ?? true)
    const [isshow, setModalShow] = useState(props.modelshow ?? false)
    useEffect(() => {
        setData(props.data)
    }, [props.data])
    useEffect(() => {
        setModalShow(props.modelshow ?? false)
    }, [props.modelshow])
    var searchItem: SearchItem = {
        page: 1,
        size: 10,
        whereList: [],
        sortList: [],
    }
    const defaultAdd = () => {
        console.log('add')
        var row = { id: moment().valueOf(), isnew: true, editable: true, state: 4 }
        props.model?.fields?.forEach(field => {
            if (field.field != undefined)
                row[field.field] = null
        })
        if (props.onAddRowing != undefined) {
            if (!props.onAddRowing(row)) return
        }
        var oldrows: any = []
        var total = 1
        if (data != undefined) {
            oldrows = [...data.rows]
            total = data.total + total
        }
        var rows = [row, ...oldrows]
        setRowEdit(true)
        setData({ rows: rows, total: total })
        if (props.onAdded != undefined) {
            props.onAdded(row)
        }
        if (props.onDataChange != undefined) {
            props.onDataChange({ rows: rows, total: total }, row, 'add')
        }
    }
    const defultRemove = () => {
        if (selectKeys.length > 0) {
            var oldid: Number[] = []
            var rerows: any[] = []
            var rows = [...data.rows]
            selectKeys.forEach(id => {
                if (id != undefined) {
                    var index = rows.findIndex(value => {
                        if (value.id == id) {
                            if (props.onRemoveRowing != undefined) {
                                if (!props.onRemoveRowing(value)) return false
                            }
                            if (!value.isnew) {
                                oldid.push(id)
                            }
                            return true
                        }
                        return false
                    })
                    var drow = rows.splice(index, 1)
                    if (props.onRemoveed != undefined) {
                        props.onRemoveed(drow[0])
                    }
                    rerows.push(drow[0])
                }
            })
            var ndata = { rows: rows, total: data.total - 1 }
            setData(ndata)
            if (props.onDataChange != undefined) {
                if (rerows.length > 0)
                    props.onDataChange(ndata, rerows, 'remove')
            }
        }
    }
    function getcmds(): CommandAttribute[] {
        var mm: CommandAttribute[] = []
        if (props.model != undefined) {
            if (props.model.isadd) {
                mm.push({ command: "add", name: "新增" })
            }
            if (props.model.isremove) {
                mm.push({ command: "remove", name: "删除", isselectrow: true, selectmultiple: true })
            }
        }
        if (props.onGetCommands != undefined) {
            mm = props.onGetCommands(mm)
        }
        return mm
    }
    function modalChange(isshow: boolean, row: any) {
        setModalShow(isshow)
        if (props.onModalChange) {
            props.onModalChange(isshow, row)
        }
    }
    function renderToolbar() {
        if (props.closetoolbar) return
        return (
            <WayToolbar iscircle={props.iscirclebutton} commandShow={comshow} selectcount={selectKeys.length} attrs={coms} isclosecard={true}
                onClick={(name: string, command: CommandAttribute) => {
                    if (props.onCommandClicking) {
                        props.onCommandClicking(command)
                    }
                    if (name == "add") {
                        defaultAdd()
                    }
                    if (name == "remove") {
                        defultRemove()
                    }
                    if (props.onCommandClicked) {
                        props.onCommandClicked(command)
                    }
                }}
                searchShow={(props.closesearch) ? false : {
                    fields: props.model?.fields,
                    onSearch: (w: SearchWhere) => {
                        searchItem.whereList = []
                        if (w != undefined) {
                            if (isArray(w)) {
                                searchItem.whereList = w
                            } else
                                searchItem.whereList = [w]
                        }
                        searchItem.page = 1
                        searchItem.sortList = []
                        if (props.onSearchData != undefined) {
                            props.onSearchData(searchItem, (data: TableData) => {
                                setData(data)
                            })
                        }
                    },
                    onSearchData: props.onSearchData
                }}
            ></WayToolbar>
        )
    }
    function renderTable() {
        return (
            <WayTable attr={props.model} data={data} isedit={!props.closeedit} rowedit={rowedit} selectType={props.selectType ?? "checkbox"} isselect={props.isselect ?? true}
                isclosecard={true}
                onSelectRows={(row, keys, selected) => {
                    setSelectKeys(keys)
                    setSelectRow(row)
                }}
                onSearchData={(item, callback) => {
                    if (item.foreign && item.field) {
                        if (props.onSearchData)
                            props.onSearchData(item, callback)
                        return
                    }
                    searchItem.page = item.page
                    searchItem.size = item.size
                    searchItem.sortList = item.sortList
                    if (props.onSearchData != undefined) {
                        props.onSearchData(searchItem, (data: TableData) => {
                            setData(data)
                        })
                    }
                }}
                onRowDataChangeing={(row, field, value) => {
                    if (props.onEditRowing != undefined) {
                        return props.onEditRowing(row, field, value)
                    }
                    if (!row.isnew && props.onDataChange != undefined) {
                        props.onDataChange(data, row, 'edit')
                    }
                    return true
                }}
                onRowDoubleClick={(event: any, record: any) => {
                    if (record.editable != undefined) {
                        setRowEdit(record.editable)
                    }
                    if (props.ismodal && isshow) {
                        modalChange(false, record)
                    }
                }}
                onGetFieldToEdit={props.onGetFieldToEdit}
                onColumnToEdit={props.onColumnToEdit}
            ></WayTable>
        )
    }
    function render() {
        if (props.ismodal) {
            return (<DragModal title={props.model?.title} width={600} visible={isshow} onCancel={() => {
                modalChange(false, null)
            }} onOk={() => {
                modalChange(false, selectRow)
            }}>
                <Card>
                    {renderToolbar()}
                    {renderTable()}
                </Card>
            </DragModal>)
        } else {
            if (props.closecard) {
                return (<>
                    {renderToolbar()}
                    {renderTable()}</>
                )
            }
            return (<Card>
                {renderToolbar()}
                {renderTable()}
            </Card>)
        }
    }
    return (render())
}
export default WayEditTable;