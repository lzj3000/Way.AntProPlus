import { Col, Row } from "antd"
import React, { useState } from "react"
import { ChildModelAttribute, CommandAttribute, SearchItem, SearchWhere, TableData } from "../Attribute"
import WayTable from "../WayTable"
import WayToolbar from "../WayToolbar"
import moment from 'moment';

interface WayEditTableProps {
    model?: ChildModelAttribute,
    data?: TableData,
    onSearchData?: (item: SearchItem) => void
}
const WayEditTable: React.FC<WayEditTableProps> = (props) => {
    const [selectKeys, setSelectKeys] = useState([])
    const [selectRow, setSelectRow] = useState(null)
    const [data, setData] = useState<TableData | undefined>(props.data)
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
            if (props.model.isedit) {
                mm.push({ command: "edit", name: "编辑", isselectrow: true })
            }
            if (props.model.isremove) {
                mm.push({ command: "remove", name: "删除", isselectrow: true, selectmultiple: true })
            }
        }
        return mm
    }
    return (<>
        <Row gutter={[16, 16]}><Col span={24}>
            <WayToolbar iscircle={true} commandShow={true} selectcount={selectKeys.length} attrs={getcmds()}
                onClick={(name: string, command: CommandAttribute) => {
                    if (name == "add") {
                        var row = { id: moment().valueOf(), isnew: true }
                        props.model?.fields?.forEach(field => {
                            if (field.field != undefined)
                                row[field.field] = null
                        })
                        var rows = [row, ...data.rows]
                        setData({ rows: rows, total: data.total + 1 })
                    }
                    if (name == "edit") {
                        if (selectRow != null) {
                            setSelectRow({ ...selectRow, editable: true })
                        }
                    }
                    if (name == "remove") {
                        if (selectKeys.length > 0) {
                            var oldid: Number[] = []
                            var newindex: Number[] = []
                            selectKeys.forEach(id => {
                                var index = data.rows.findIndex(r => {
                                    return r.id == id
                                })
                                var row = data.rows[index]
                                if (row.isnew)
                                    newindex.push(index)
                                else
                                    oldid.push(id)
                            })
                            var rows = [...data.rows]
                            newindex.forEach(i => {
                                delete rows[i]
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
            <WayTable attr={props.model} data={data} isselect={props.model?.ischeck} isedit={true}
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
            ></WayTable></Col></Row>
    </>)
}
export default WayEditTable;