import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Tabs } from 'antd';
import { ChildModelAttribute, ModelAttribute, WayFieldAttribute, SearchItem, TableData } from '../Attribute'
import { ExpandableConfig, SorterResult, TablePaginationConfig } from 'antd/lib/table/interface';
import { isArray } from 'lodash';
import WayTextBox from '../WayTextBox'


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
        console.log('WayTable.useEffect.rowedit' + "=" + String(props.rowedit))
        setRowedit(props.rowedit)
    }, [props.rowedit])
    function getcolumns(attr: ModelAttribute) {
        var cols = []
        attr?.fields?.filter((field) => field.visible).forEach((item) => {
            cols.push({
                dataIndex: item.field, title: item.title, sorter: true, render: (text: any, record: any) => {
                    if (record == undefined) return
                    if (rowedit && record.editable) {
                        const [rv, setrv] = useState(record[item.field])
                        return <WayTextBox value={rv} onChange={(value) => {
                            setrv((v) => {
                                if (props.onRowDataChangeing != undefined) {
                                    if (!props.onRowDataChangeing(record, item.field, value)) return value
                                }
                                record[item.field] = value
                                return value
                            })
                        }} attr={item} />
                    } else {
                        var data = text
                        if (item.comvtp?.isvtp) {
                            var mmap: Map<Number, string> = new Map(item.comvtp.items)
                            data = mmap.get(text)
                        }
                        if (item.type == 'boolean')
                            data = (data) ? "是" : "否"
                        if (props.onFieldRender != undefined) {
                            return props.onFieldRender(item, data, record)
                        }
                        return <>{data}</>
                    }
                }
            })
        })
        return cols
    }
    const handleTableChange = (pagination: TablePaginationConfig, filters: Record<string, any[] | null>, sorter: SorterResult<any> | SorterResult<any>[]) => {
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
    const setLoaded = (data: TableData) => {
        setLoading(false)
        setData(data)
    }
    function getsort(sort: SorterResult<any>): string {
        if (sort.column == undefined) return ''
        var ss = sort.field
        if (sort.order == "descend")
            ss = ss + " desc"
        return ss
    }
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [selectType, setSelectType] = useState<string | "checkbox" | "radio">(props.selectType ?? "checkbox")
    const [selectTitle, setSelectTitle] = useState<JSX.Element | null>((props.selectType != null && props.selectType == 'radio') ? radiobutton() : null)
    const onSelectChange = (keys: any[], selectedRows: Object[]) => {
        console.log('selectedRowKeys changed: ', keys);
        var selected = selectedRowKeys.length <= keys.length
        setSelectedRowKeys(keys)
        if (props.onSelectRows != undefined) {
            if (keys.length > 0) {
                props.onSelectRows(selectedRows[selectedRows.length - 1], keys, selected)
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
            columnWidth:'60px',
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
        if (props.isexpandable) {
            if (props.onExpandable == undefined) {
                return {
                    onExpand: (expanded: any, record: any) => {
                        if (!expanded) return
                        if (props?.attr?.childmodels != undefined && props.attr.childmodels.length > 0) {
                            var cm = props?.attr?.childmodels[0]
                            if (!record[cm.name]) {
                                record[cm.name] = []
                            }
                            record[cm.name].total = record[cm.name].length
                            if (record[cm.name].total == 0) {
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
                        r[cm.name] = cmdata.rows
                        r[cm.name].total = cmdata.total
                    }
                })
                setData({ rows: rows, total: data.total })
            })
        }
    }
    const expandedRowRender = (record: any) => {
        if (props?.attr?.childmodels != undefined && props.attr.childmodels.length > 0) {
            return (<Tabs defaultActiveKey={"0"}>
                {
                    props.attr.childmodels.map((cm, index) => {
                        if (!record[cm.name])
                            record[cm.name] = []
                        record[cm.name].total = record[cm.name].length
                        return (
                            <TabPane tab={cm.title} key={index}>
                                <WayTable key={"id"} attr={cm} isselect={false} isclosecard={true} data={{ rows: record[cm.name], total: record[cm.name].total }}
                                    isedit={false} onSearchData={((item: SearchItem) => {
                                        getchildTable(item, cm, record)
                                    })}
                                ></WayTable>
                            </TabPane>
                        )
                    })
                }
            </Tabs>)
        }
    }
    function getTable() {
        return (<Table
            bordered={true}
            rowKey="id"
            columns={getcolumns(props.attr)}
            rowSelection={rowSelection()}
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