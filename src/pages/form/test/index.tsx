import React, { useState } from 'react';
import WayTextBox, { TextType } from '@/components/WayTextBox'
import WayToolbar from '@/components/WayToolbar'
import WayForm, { FormPlus } from '@/components/WayForm'
import { ChildModelAttribute, ModelAttribute } from '@/components/Attribute'

import { Divider, Form } from 'antd'
import WayTable, { TableData } from '@/components/WayTable';
import WayEditTable from '@/components/WayForm/edittable';

export default function Page() {
    const [vs, setStringValue] = useState("HelloWold")
    const [vn, setNumberValue] = useState(20)
    const [dn, setDateValue] = useState("1989-08-18")
    const [bn, setBoolValue] = useState(true)
    const [sn, setSelectValue] = useState(1)
    var item = new Map([[0, '北京'], [1, '上海'], [2, '深圳'], [3, '成都']])
    const [ttt, setTestValue] = useState({ type: "string" })
    var [dttext, setDtTest] = useState(null)
    var [comm, onCommand] = useState("")
    var buttons = [
        { command: "add", name: "新增" },
        { command: "edit", name: "编辑" },
        { command: "remove", name: "删除", isalert: true },
        { command: "test1", name: "测试1", isselectrow: true },
        { command: "save", name: "保存" },
        { command: "get", name: "获取" },
        { command: "test4", name: "测试4", issplit: true, splitname: "test2", isalert: true },
        { command: "test5", name: "测试5", issplit: true, splitname: "save", isselectrow: true },
        { command: "test6", name: "测试6", issplit: true, splitname: "save" },
    ]
    var r = [
        { id: 1, name: "X1", age: 24, "born": "2020-12-03", "ismirc": true, "city": 3 },
        { id: 2, name: "X2", age: 27, "born": "2020-12-03", "ismirc": false, "city": 2 },
        { id: 3, name: "X3", age: 22, "born": "2020-12-03", "ismirc": true, "city": 1 },
        { id: 4, name: "X4", age: 13, "born": "2020-12-03", "ismirc": false, "city": 0 },
        { id: 5, name: "X5", age: 22, "born": "2020-12-03", "ismirc": true, "city": 2 },
        { id: 6, name: "X6", age: 26, "born": "2020-12-03", "ismirc": false, "city": 3 },
    ]
    const [model, setModel] = useState<ChildModelAttribute>({
        isadd: true,
        isedit: true,
        isremove: true,
        ischeck: true,
        fields: [
            { field: 'name', title: '姓名', type: 'string', required: true, visible: true, isedit: true },
            { field: 'age', title: '年龄', type: 'int', required: true, visible: true, pointlength: 2, isedit: true },
            { field: 'born', title: '出生日期', type: 'datetime', visible: true, isedit: true },
            { field: 'ismirc', title: '是否已婚', type: 'boolean', required: true, visible: true, isedit: true },
            { field: 'city', title: '居住城市', type: 'int', required: true, visible: true, isedit: true, disabled: false, comvtp: { isvtp: true, items: item } }
        ],
        childmodels: [{
            visible: true,
            fields: [
                { field: 'test', title: 'test', type: 'string', required: true, visible: true, isedit: true }
            ]
        }]
    })
    const [data, setRows] = useState<TableData>({ rows: [], total: 0 })
    var form: FormPlus
    const [values, setValues] = useState(null)
    const [edittable, setEditTable] = useState({
        add: '',
        edit: '',
        remove: ''
    })
    return (
        <div>
            <div>{edittable.add}</div>
            <div>{edittable.edit}</div>
            <div>{edittable.remove}</div>
            <Divider plain>EDITTABLE TEST</Divider>
            <WayEditTable model={model} data={data} iscirclebutton={true} onSearchData={(item) => {
                setRows({ rows: r, total: r.length })
            }}
                onAddRowing={(row) => {
                    var data = Object.assign({}, edittable, { add: 'onAddRowing' })
                    setEditTable(data)
                    return true
                }}
                onAdded={(row) => {
                    var data = Object.assign({}, edittable, { add: 'onAdded' })
                    setEditTable(data)
                }}
                onEditRowing={(row, field, value) => {
                    var data = Object.assign({}, edittable, { edit: 'onEditRowing' })
                    setEditTable(data)
                    return true
                }}
                onRemoveRowing={(row) => {
                    var data = Object.assign({}, edittable, { remove: 'onRemoveRowing' })
                    setEditTable(data)
                    return true
                }}
                onRemoveed={(row) => {
                    var data = Object.assign({}, edittable, { remove: 'onRemoveed' })
                    setEditTable(data)
                }}
            ></WayEditTable>
            <Divider plain>TABLE TEST</Divider>
            <WayTable attr={model} data={data} isedit={true} isselect={true} isexpandable={false} onSelectRows={(row, keys, selected) => {
                if (selected)
                    setValues(row) //form.setFieldsValue(row)
                else
                    setValues(undefined)// form.resetFields()
            }}></WayTable>
            <Divider plain>FORM TEST</Divider>
            <WayForm attr={model} onFinish={setValues} values={values} ></WayForm>
            <div>{JSON.stringify(values)}</div>
            <Divider plain>BUTTON TEST</Divider>
            <WayToolbar searchShow={{
                fields: model.fields,
                onSearch: (w) => {
                    onCommand('search:' + w.name + w.symbol + w.value)

                    setRows({ rows: r, total: r.length })
                },
            }} commandShow={true} helpShow={{ isset: true, ishelp: true }} onClick={(name) => {
                if (name == "save") {
                    form.submit()
                }
                if (name == "get") {
                    form.setFieldsValue({ "name": "XXX", "age": 24, "born": "2020-12-03", "ismirc": true, "city": 3 })
                }
                if (name == "test6") {
                    form.resetFields()
                }
                if (name == "edit") {
                    form.setFieldDisabled("city", false)
                }
                if (name == 'remove') {
                    setRows(null)
                }
                onCommand(name)
            }} attrs={buttons}></WayToolbar>
            <WayToolbar commandShow={true} iscircle={true} attrs={buttons}></WayToolbar>
            <div>{comm}</div>
            <Divider plain>TEXTBOX TEST</Divider>
            <WayTextBox value={vs} onChange={setStringValue} ></WayTextBox>
            <div>{vs}</div>
            <WayTextBox value={vn} onChange={setNumberValue} attr={{ type: "int" }} ></WayTextBox>
            <div>{vn}</div>
            <WayTextBox value={dn} onChange={setDateValue} attr={{ type: "datetime" }} ></WayTextBox>
            <div>{dn}</div>
            <WayTextBox value={bn} onChange={setBoolValue} attr={{ type: "boolean" }} ></WayTextBox>
            <div>{String(bn)}</div>
            <WayTextBox value={sn} onChange={(v) => {
                setSelectValue(v)
                setTestValue({ type: item.get(v) })
            }} attr={{ type: "string", comvtp: { isvtp: true, items: item } }} ></WayTextBox>
            <div>{String(sn) + "---" + item.get(sn)}</div>
            <WayTextBox value={dttext} onChange={setDtTest} attr={ttt} disabled={bn} ></WayTextBox>
            <div>{String(dttext)}</div>
            <WayTextBox disabled={!bn} value={dn} onChange={setDateValue} textType={TextType.DatePicker} ></WayTextBox>
        </div>
    );
}