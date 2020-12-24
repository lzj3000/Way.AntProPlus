import { Col, Row } from "antd"
import React, { useState } from "react"
import { ChildModelAttribute, CommandAttribute, SearchItem, SearchWhere, TableData } from "../Attribute"
import WayTable from "../WayTable"
import WayToolbar from "../WayToolbar"
import moment from 'moment';

interface WayEditTableProps {
    model?: ChildModelAttribute,
    data?: TableData,
    iscirclebutton?: boolean,
    onSearchData?: (item: SearchItem) => void
    onAddRowing?: (row: any) => boolean,
    onAdded?: (row: any) => void,
    onEditRowing?: (row: any, field: string, value: any) => boolean,
    onRemoveRowing?: (row: any) => boolean,
    onRemoveed?: (row: any) => void,
}
const WayEditTable: React.FC<WayEditTableProps> = (props) => {
    const [selectKeys, setSelectKeys] = useState([])
    const [selectRow, setSelectRow] = useState(null)
    const [rowedit, setRowEdit] = useState(false)
    const [data, setData] = useState<TableData | undefined>(props.data)
    const [coms, setToolbar] = useState<CommandAttribute[]>(getcmds())
    var searchItem: SearchItem = {
        page: 1,
        size: 10,
        whereList: [],
        sortList: [],
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
        return mm
    }
    return (<>
        <Row gutter={[16, 16]}><Col span={24}>
            <WayToolbar iscircle={props.iscirclebutton} commandShow={true} selectcount={selectKeys.length} attrs={coms}
                onClick={(name: string, command: CommandAttribute) => {
                    if (name == "add") {
                        console.log('Edittable.add')
                        var row = { id: moment().valueOf(), isnew: true, editable: true }
                        props.model?.fields?.forEach(field => {
                            if (field.field != undefined)
                                row[field.field] = null
                        })
                        if (props.onAddRowing != undefined) {
                            if (!props.onAddRowing(row)) return
                        }
                        var rows = [row, ...data.rows]
                        setRowEdit(true)
                        setData({ rows: rows, total: data.total + 1 })
                        if (props.onAdded != undefined) {
                            props.onAdded(row)
                        }
                    }
                    if (name == "remove") {
                        if (selectKeys.length > 0) {
                            var oldid: Number[] = []
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
                                        props.onRemoveed(drow)
                                    }
                                }
                            })
                            setData({ rows: rows, total: data.total - 1 })
                        }
                    }
                }}
                searchShow={{
                    fields: props.model?.fields,
                    onSearch: (w: SearchWhere) => {
                        searchItem.whereList[w]
                        searchItem.page = 1
                        if (props.onSearchData != undefined) {
                            props.onSearchData(searchItem)
                        }
                    }
                }}
            ></WayToolbar></Col></Row>
        <Row gutter={[16, 16]}><Col span={24}>
            <WayTable attr={props.model} data={data} isselect={props.model?.ischeck} isedit={true} rowedit={rowedit}
                onSelectRows={(row, keys, selected) => {
                    setSelectKeys(keys)
                    if (selected)
                        setSelectRow(row)
                    else
                        setSelectRow(null)
                }}
                onSearchData={(item) => {
                    searchItem.page = item.page
                    searchItem.size = item.size
                    searchItem.sortList = item.sortList
                    if (props.onSearchData != undefined) {
                        props.onSearchData(searchItem)
                    }
                }}
                onRowDataChangeing={(row, field, value) => {
                    if (props.onEditRowing != undefined) {
                        return props.onEditRowing(row, field, value)
                    }
                    return true
                }}
                onRowDoubleClick={(event:any, record:any) => {
                    if (record.editable != undefined) {
                        setRowEdit(record.editable)
                    }
                }}
            ></WayTable></Col></Row>
    </>)
}
export default WayEditTable;