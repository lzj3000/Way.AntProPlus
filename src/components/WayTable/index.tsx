import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Tabs } from 'antd';
import { ChildModelAttribute, ModelAttribute, WayFieldAttribute, SearchItem, TableData } from '../Attribute'
import { ExpandableConfig, SorterResult, TablePaginationConfig } from 'antd/lib/table/interface';
import { isArray } from 'lodash';
import WayTextBox from '../WayTextBox'
import { models } from '@/.umi/plugin-model/Provider';
import moment, { isMoment } from 'moment';


export interface WayTableProps {
    attr?: ChildModelAttribute,
    data?: TableData | null,
    loading?: boolean,
    isselect?: boolean,
    selectType?: string | "checkbox" | "radio",
    isedit?: boolean,
    isexpandable?: boolean,
    rowedit?: boolean,
    isclosecard?: boolean,
    onExpandable?: (attr: ChildModelAttribute) => ExpandableConfig<Object>
    onFieldRender?: (field: WayFieldAttribute, text: any, record: any) => JSX.Element,
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void,
    onSelectRows?: (row: Object | null, selectedRows: any[], selected: boolean) => void,
    onSelectStateChange?: (ischeck: boolean) => void,
    onRowClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>, row: object) => void,
    onRowDoubleClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>, row: object) => void,
    onRowMouseEnter?: (event: React.MouseEvent<HTMLElement, MouseEvent>, row: object) => void,
    onMouseLeave?: (event: React.MouseEvent<HTMLElement, MouseEvent>, row: object) => void,
    onRowDataChangeing?: (row: any, field: string, value: any) => boolean,
    onExpandedRowTabPane?: (childmodel: ChildModelAttribute, record: any) => JSX.Element
}

const TabPane = Tabs.TabPane

const WayTable: React.FC<WayTableProps> = (props) => {
    const [loading, setLoading] = useState(props.loading ?? false)
    const [data, setData] = useState(props.data ?? { rows: [], total: 0 })
    const [rowedit, setRowedit] = useState(props.rowedit ?? false)

    useEffect(() => {
        setData(props.data ?? { rows: [], total: 0 })
        setSelectedRowKeys([])
    }, [props.data])
    useEffect(() => {
        setRowedit(props.rowedit ?? false)
    }, [props.rowedit])
    useEffect(() => {
        setLoading(props.loading ?? false)
    }, [props.loading])
    const getColumns = (attr: ModelAttribute) => {
        var cols: any = []
        function columnToDisplay(text: any, item: WayFieldAttribute, record: any) {
            var data = text
            if (item.comvtp?.isvtp) {
                var mmap: Map<Number, string> = new Map(item.comvtp.items)
                data = mmap.get(text)
            }
            if (item.foreign?.isfkey) {
                var oofiled = item.foreign.oneobjecfiled.toLocaleLowerCase()
                var odname = item.foreign.onedisplayname.toLocaleLowerCase()
                if (record[oofiled])
                    data = record[oofiled][odname]
            }
            if (item.type == 'boolean')
                data = (data) ? "是" : "否"
            if (item.type == 'datetime') {
                var fm = 'YYYY-MM-DD'
                if (item.title?.indexOf('时间') > -1) {
                    fm = 'YYYY-MM-DD hh:mm'
                }
                data = data != "" ? moment(data).format(fm).toString() : ""
            }
            if (props.onFieldRender != undefined) {
                return props.onFieldRender(item, data, record)
            }
            return <>{data}</>
        }
        function columnToEdit(item: any, record: any) {
            const [editvalue, setEditValue] = useState(record[item.field])
            return <WayTextBox attr={item} value={editvalue} onChange={(value) => {
                if (props.onRowDataChangeing != undefined) {
                    if (!props.onRowDataChangeing(record, item.field, value)) return
                }
                record[item.field] = value
                setEditValue(value)
            }}
                onSearchBefore={(item: SearchItem, callback) => {
                    if (props.onSearchData) {
                        props.onSearchData(item, (data) => {
                            callback(data.model, data)
                        })
                    }
                }}
                onSearchData={props.onSearchData}
            />
        }
        attr?.fields?.filter((field) => field.visible).forEach((item) => {
            cols.push({
                dataIndex: item.field, title: item.title, sorter: true, render: (text: any, record: any) => {
                    if (record == undefined) return
                    if (rowedit && record.editable) {
                        return columnToEdit(item, record)
                    } else {
                        return columnToDisplay(text, item, record)
                    }
                }
            })
        })
        return cols
    }
    const handleTableChange = (pagination: TablePaginationConfig, filters: Record<string, any[] | null>, sorter: SorterResult<any> | SorterResult<any>[]) => {
        const setLoaded = (data: TableData) => {
            setLoading(false)
            setData(data)
        }
        const getsort = (sort: SorterResult<any>): string => {
            if (sort.column == undefined) return ''
            var ss = { name: sort.field, isdesc: false }
            if (sort.order == "descend")
                ss.isdesc = true
            return ss
        }
        setLoading(true)
        try {
            var item: SearchItem = {
                page: pagination.current ?? 1,
                size: pagination.pageSize ?? 10,
                sortList: [],
            }

            if (sorter != undefined) {
                if (isArray(sorter)) {
                    sorter.forEach((item) => {
                        var s = getsort(item)
                        if (s != '')
                            item.sortList.push(s)
                    })
                } else {
                    var s = getsort(sorter)
                    if (s != '')
                        item.sortList.push(s)
                }
            }
            if (props.onSearchData != undefined) {
                props.onSearchData(item, setLoaded)
            }
        }
        finally {
            setLoading(false)
        }
    }

    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [selectType, setSelectType] = useState<string | "checkbox" | "radio">(props.selectType ?? "checkbox")
    const [selectTitle, setSelectTitle] = useState<JSX.Element | null>((props.selectType != null && props.selectType == 'radio') ? radiobutton() : null)
    const onSelectChange = (keys: any[], selectedRows: Object[]) => {
        var selected = selectedRowKeys.length <= keys.length
        setSelectedRowKeys(keys)
        if (props.onSelectRows != undefined) {
            if (keys.length > 0) {
                var row = selectedRows[selectedRows.length - 1]
                if (!selected) {
                    row = null
                    if (keys.length == 1) {
                        row = data.rows.find(r => r.id == keys[0])
                    }
                }
                props.onSelectRows(row, keys, selected)
            } else {
                props.onSelectRows(null, keys, false)
            }

        }
    }
    const rowSelection = () => {
        if (!props.isselect) return undefined
        return {
            selectedRowKeys: selectedRowKeys,
            fixed: true,
            type: selectType,
            columnTitle: selectTitle,
            columnWidth: '60px',
            selections: [
                {
                    key: 'invert',
                    text: '反选',
                    onSelect: (changeableRowKeys: any[]) => {
                        var invertKeys = changeableRowKeys.filter((key) => {
                            return !selectedRowKeys.includes(key)
                        })
                        var rows = data.rows.filter(item => invertKeys.includes(item.id))
                        onSelectChange(invertKeys, rows)
                    }
                },
                {
                    key: "CheckboxOrRadio", text: "切换单选",
                    onSelect: () => {
                        getSelectType(selectType)
                    }
                }
            ],
            onChange: onSelectChange,
        }
    }
    function getSelectType(type: string) {
        if (type == "checkbox") {
            setSelectType('radio')
            setSelectedRowKeys([])
            if (props.onSelectStateChange)
                props.onSelectStateChange(false)
            setSelectTitle(radiobutton())
        }
    }
    function radiobutton(): JSX.Element {
        return <Button type={"link"} onClick={() => {
            setSelectTitle(null)
            setSelectType('checkbox')
            setSelectedRowKeys([])
            if (props.onSelectStateChange)
                props.onSelectStateChange(true)
        }}>多选</Button>
    }
    function setrowedit(record) {
        if (props.isedit) {
            record.editable = !rowedit
            var rows = [...data.rows]
            rows.forEach(r => {
                if (r.id == record.id) {
                    r.editable = !rowedit
                } else {
                    if (r.editable)
                        r.editable = false
                }
            })
            setRowedit(!rowedit)
        }
    }
    function expandable(): ExpandableConfig<Object> | undefined {
        if (props.isexpandable && props?.attr?.childmodels != undefined && props.attr.childmodels.length > 0) {
            if (props.onExpandable == undefined) {
                return {
                    onExpand: (expanded: any, record: any) => {
                        if (!expanded) return
                        if (props?.attr?.childmodels != undefined && props.attr.childmodels.length > 0) {
                            var cm = props?.attr?.childmodels[0]
                            if (!record[cm.propertyname]) {
                                record[cm.propertyname] = []
                            }
                            record[cm.propertyname].total = record[cm.propertyname].length
                            if (record[cm.propertyname].total == 0) {
                                var item: SearchItem = { page: 1, size: 10 }
                                getchildTable(item, cm, record)
                            }
                        }
                    },
                    expandedRowRender: expandedRowRender
                }
            } else {
                return props.onExpandable(props.attr)
            }
        }
        return undefined
    }
    function getchildTable(item: SearchItem, cm: ChildModelAttribute, record: any) {
        item.childmodel = cm
        item.parent = record
        if (props.onSearchData != undefined) {
            props.onSearchData(item, (cmdata: TableData) => {
                var rows = [...data.rows]
                rows.forEach((r) => {
                    if (r.id == record.id) {
                        r[cm.propertyname] = cmdata.rows
                        r[cm.propertyname].total = cmdata.total
                    }
                })
                setData({ rows: rows, total: data.total })
            })
        }
    }
    const expandedRowTabPane = (childmodel, record) => {
        if (props.onExpandedRowTabPane) {
            var div = props.onExpandedRowTabPane(childmodel, record)
            if (div != undefined)
                return div
        }
        var pane = {
            key: 'id',
            attr: childmodel,
            isselect: false,
            isedit: false,
            data: { rows: record[childmodel.propertyname], total: record[childmodel.propertyname].total },
            onSearchData: (item: SearchItem) => {
                getchildTable(item, childmodel, record)
            }
        }
        return (<WayTable {...pane}></WayTable>)
    }
    const expandedRowRender = (record: any) => {
        if (props?.attr?.childmodels != undefined && props.attr.childmodels.length > 0) {
            return (<Tabs defaultActiveKey={"0"} onChange={(activeKey) => {
                var cm = props.attr.childmodels[Number(activeKey)]
                getchildTable({}, cm, record)
            }}>
                {
                    props.attr.childmodels.map((cm, index) => {
                        if (!record[cm.propertyname])
                            record[cm.propertyname] = []
                        record[cm.propertyname].total = record[cm.propertyname].length
                        return (
                            <TabPane tab={cm.title} key={index}>
                                {expandedRowTabPane(cm, record)}
                            </TabPane>
                        )
                    })
                }
            </Tabs>)
        }
    }
    function getTable() {
        var columns = getColumns(props.attr)
        return (<Table
            bordered={true}
            rowKey="id"
            columns={columns}
            rowSelection={rowSelection()}
            scroll={{ x: columns.length * 150 }}
            dataSource={data.rows}
            pagination={{ current: 1, pageSize: 10, total: data.total }}
            loading={loading}
            expandable={expandable()}
            onChange={handleTableChange}
            onRow={record => {
                return {
                    onClick: event => {
                        event.stopPropagation()
                        try {
                            if (rowSelection()?.type == "radio")
                                onSelectChange([record.id], [record])
                            if (rowSelection()?.type == "checkbox") {
                                var id = record.id
                                var keys = []
                                if (selectedRowKeys.includes(id)) {
                                    keys = selectedRowKeys.filter(key => key != id)
                                } else {
                                    keys = [...selectedRowKeys]
                                    keys.push(id)
                                }
                                onSelectChange(keys, [record])
                            }
                        }
                        finally {
                            if (props.onRowClick) {
                                props.onRowClick(event, record)
                            }
                        }
                    }, // 双点击行
                    onDoubleClick: event => {
                        event.stopPropagation()
                        setrowedit(record)
                        if (props.onRowDoubleClick) {
                            props.onRowDoubleClick(event, record)
                        }
                    },
                    onMouseEnter: event => {
                        if (props.onRowMouseEnter) {
                            props.onRowMouseEnter(event, record)
                        }
                    }, // 鼠标移入行
                    onMouseLeave: event => {
                        if (props.onMouseLeave) {
                            props.onMouseLeave(event, record)
                        }
                    },
                };
            }}
        />)
    }
    if (props.isclosecard)
        return (getTable())
    return (<Card>{getTable()}</Card>)
}

export default WayTable;