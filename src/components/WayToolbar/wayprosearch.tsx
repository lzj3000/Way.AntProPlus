import React, { useState } from 'react';
import WayTextBox, { TextType } from '../WayTextBox'
import { Button, Input, Cascader } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { SearchItem, SearchWhere, TableData, WayFieldAttribute } from '../Attribute'
import { isArray } from 'lodash';


export interface WayProSearchProps {
    fields?: WayFieldAttribute[],
    onSearch: (w: SearchWhere) => void
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void
}
const dateItems = ["===", "year", "quarter", "month", "week"]
const WayProSearch: React.FC<WayProSearchProps> = (props) => {
    const symbolType = new Map<string, object[]>();
    symbolType.set('string', [{ label: "包含", value: "like" },
    { label: "为空", value: "isnull" },
    { label: "不为空", value: "isnotnull" },
    { label: "左匹配", value: "left" },
    { label: "右匹配", value: "right" },
    { label: "等于", value: "=" }])
    symbolType.set('int', [{ label: "大于", value: ">" },
    { label: "小于", value: "<" },
    { label: "等于", value: "=" }])
    symbolType.set('datetime', [
        { label: "范围", value: "date" },
        { label: "周", value: "week" },
        { label: "月", value: "month" },
        { label: "季", value: "quarter" },
        { label: "年", value: "year" },])

    const [text, setTextChange] = useState({ value: '', attr: { type: 'string' } })
    const [nameType, setNameType] = useState({ name: '*', type: 'string', symbol: '' })
    const [textOption, setTextOption] = useState({
        picker: null
    })
    var option = [{ label: '全部', value: '*' }]
    if (props.fields != undefined) {
        props.fields.forEach((item) => {
            var child = item.searchsymbol ?? symbolType.get(item.type)
            if (item.type == 'datetime') {
                child = symbolType.get(item.type)
            }
            if (item.foreign && item.foreign.isfkey) {
                console.log(child)
                var c = child.find((f => f.label == '等于' ))
                child=[c]
            }
            option.push({ label: item.title, value: item.field, children: child })
        })
    }
    function renderCascader() {
        return (<Cascader style={{ width: '35%' }} options={option} allowClear={false} defaultValue={['*']} onChange={(value) => {
            console.log(value)
            var name = value[0]
            var field = props.fields?.find((item) => item.field == name)
            setNameType({ name: name, symbol: value[1], type: field?.type })
            setTextChange({ value: '', attr: field })
            if (field?.type == "datetime") {
                var data = { ...textOption }
                data.picker = value[1]
                setTextOption(data)
            }
        }} />)
    }
    function renderTextBox() {
        return (<WayTextBox width={'50%'} options={textOption} search={true} name={nameType.name}
            attr={text.attr} value={text.value} onChange={(value) => {
                console.log(value)
                setTextChange({ value: value, attr: text.attr })
            }}
            onSearchBefore={(item, callback) => {
                if (props.onSearchData) {
                    props.onSearchData(item, (data) => {
                        callback(data.model, data)
                    })
                }
            }}
            onSearchData={props.onSearchData}
        />)
    }
    function renderButton() {
        return (<Button style={{ width: '15%' }} type={'primary'} icon={<SearchOutlined />} onClick={() => {
            var item = { name: nameType.name, symbol: nameType.symbol, value: text.value }
            if (item.name == "*" && item.value == "")
                props.onSearch()
            else {
                if (text.attr.type == 'datetime') {
                    if (text.value != '' && isArray(text.value)) {
                        var items = []
                        if (text.value[0] != null) {
                            item.symbol = ">="
                            item.value = text.value[0].format('YYYY-MM-DD').toString()
                            items.push(item)
                        }
                        if (text.value[1] != null) {
                            items.push({ name: nameType.name, symbol: "<=", value: text.value[1].format('YYYY-MM-DD').toString() })
                        }
                        return props.onSearch(items)
                    }
                }
                props.onSearch(item)
            }
        }
        }></Button>)
    }
    function render() {
        return (
            <Input.Group compact>
                {renderCascader()}
                {renderTextBox()}
                {renderButton()}
            </Input.Group >
        )
    }
    return (render())
}

export default WayProSearch;