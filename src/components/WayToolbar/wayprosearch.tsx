import React, { useState } from 'react';
import WayTextBox from '../WayTextBox'
import { Button, Input, Cascader } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {SearchWhere} from '../Attribute'


interface CascaderProps {
    field: string,
    title: string,
    type: string
}
export interface WayProSearchProps {
    fields?: CascaderProps[],
    onSearch: (w: SearchWhere) => void
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
    { label: "大于等于", value: ">=" },
    { label: "小于等于", value: "<=" },
    { label: "等于", value: "=" }])
    symbolType.set('datetime', [{ label: "大于", value: ">" },
    { label: "小于", value: "<" },
    { label: "范围", value: "===" },
    { label: "年", value: "year" },
    { label: "季", value: "quarter" },
    { label: "月", value: "month" },
    { label: "周", value: "week" },
    { label: "等于", value: "=" }])
    const [value, setValue] = useState('')
    const [nameType, setNameType] = useState({ name: '*', type: 'string', symbol: '' })
    const [searchModel, setSearchModel] = useState(false)
    const [textOption, setTextOption] = useState({
        style: { width: '50%' }
    })
    var option = [{ label: '全部', value: '*' }]
    if (props.fields != undefined) {
        props.fields.forEach((item) => {
            var child = symbolType.get(item.type)
            option.push({ label: item.title, value: item.field, children: child })
        })
    }
    return (
        <Input.Group compact>
            <Cascader style={{ width: '35%' }} options={option} allowClear={false} defaultValue={['*']} onChange={(value) => {
                var name = value[0]
                var field = props.fields?.find((item) => item.field == name)
                setNameType({ name: name, symbol: value[1], type: field?.type })
                if (field?.type == "datetime") {
                    var data = {}
                    data.style = { width: '50%' }
                    if (dateItems.includes(value[1])) {
                        setSearchModel(true)
                        if (value[1] != "===")
                            data.picker = value[1]
                    }
                    else {
                        setSearchModel(false)
                    }
                    setTextOption(data)
                }
                setValue('')
            }} />
            <WayTextBox options={textOption} search={searchModel} name={nameType.name} attr={{ type: nameType.type }} value={value} onChange={setValue} />
            <Button style={{ width: '15%' }} type={'primary'} icon={<SearchOutlined />} onClick={() => {
                props.onSearch({ name: nameType.name, symbol: nameType.symbol, value: value })
            }}></Button>
        </Input.Group >
    )
}

export default WayProSearch;