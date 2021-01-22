import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Col, message, Modal, Progress, Row, Space, Upload } from 'antd';
import { StepProps } from 'antd/lib/steps';
import React, { useEffect, useState } from 'react';
import WayStepFrom, { WayStepProps } from '../WayForm/stepform';
import { Typography } from 'antd';
import WayTable from '.';
import { ModelAttribute, SearchItem, TableData, WayFieldAttribute } from '../Attribute';
import WayEditTable from '../WayForm/edittable';
import * as XLSX from 'xlsx';
import Dragger from 'antd/lib/upload/Dragger';
import { FormPlus } from '../WayForm';

const { Title } = Typography;

interface ImportFormProps {
    title?: string
    isShow: boolean
    attr: ModelAttribute
    onAdd?: any
    form?: FormPlus
    onShowChange?: (isshow: boolean) => void
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void
}

const ImportForm: React.FC<ImportFormProps> = (props) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isshow, setModalShow] = useState(props.isShow ?? false)
    const [rowcount, setRowCount] = useState(0)
    const [sourceTable, setSourceTable] = useState({ model: undefined, data: { rows: [], total: 0 } })
    const [targetFields, setTargetFields] = useState<WayFieldAttribute[]>(filterfields(props.attr))
    const [importCount, setImportCount] = useState(0)
    const [importState, setImportState] = useState({
        message: '',
        description: '',
        type: 'success'
    })
    const [upfileResult, setUpfileResult] = useState(null)

    const [sourceTotargetMapTable, setSourceTotargetMapTable] = useState({
        model: null,
        rows: [],
        total: 0
    })
    const [stopImport, setStopImport] = useState(false)

    function clearstate() {
        setCurrentStep(0)
        setRowCount(0)
        setSourceTable({ model: undefined, data: { rows: [], total: 0 } })
        setImportCount(0)
        setImportState({
            message: '',
            description: '',
            type: 'success'
        })
        setUpfileResult(null)
        setSourceTotargetMapTable({
            model: null,
            rows: [],
            total: 0
        })
        setStopImport(false)
    }
    function filterfields(attr) {
        return attr.fields?.filter((field) => { return field.visible && !field.disabled })
    }
    useEffect(() => {
        setModalShow(props.isShow)
    }, [props.isShow])
    useEffect(() => {
        setTargetFields(filterfields(props.attr))
    }, [props.attr])
    function stepItem() {
        var step1: WayStepProps = { title: "上传导入文件" }
        var step2: WayStepProps = { title: "设置导入映射" }
        var step3: WayStepProps = { title: "导入数据" }
        var items: WayStepProps[] = [step1, step2, step3]
        return items
    }
    function getattr(table: any[]): ModelAttribute {
        var attr: ModelAttribute = { fields: [] }
        if (table.length > 0) {
            for (var n in table[0]) {
                attr.fields?.push({ field: n, title: n, type: "string", visible: true, sorter: false })
            }
        }
        return attr
    }
    function setshowtable(result) {
        const { rowcount, data } = result
        if (rowcount > 0) {
            setRowCount(rowcount - 1)
            var m = getattr(data)
            var rows = []
            for (var i = 0; i < 6; i++) {
                rows.push(data[i])
            }
            setSourceTable({ model: m, data: { rows: rows, total: 5 } })
        }
    }


    function mapFileToData() {
        if (sourceTotargetMapTable.model != null) return
        var sourceItems = new Map<number, string>()
        var targetItems = new Map<number, string>()
        sourceTable.model?.fields?.forEach((field, index) => {
            sourceItems.set(index, field.title)
        })
        var data: any = []
        targetFields.forEach((field, index) => {
            targetItems.set(index, field.title)
            var fm = (field.foreign && field.foreign.isfkey) ? "Name" : ""
            var sourcefield = sourceTable.model?.fields?.find((sf) => {
                return sf.field == field.field || sf.field == field.title
            })
            var sindex = undefined;
            if (sourcefield == undefined || sourcefield == null) {
                if (index < sourceTable.model?.fields.length)
                    sindex = index
                data.push({ id: index, source: sindex, target: index, defaultValue: "", foreignMap: fm })
            } else {
                for (let item of sourceItems.entries()) {
                    if (sourcefield.title == item[1] || sourcefield.field == item[1]) {
                        sindex = item[0]
                        break
                    }
                }
                data.push({ id: index, source: sindex, target: index, defaultValue: "", foreignMap: fm })
            }
        })
        var items = [
            { field: "source", title: "来源列名", type: "string", comvtp: { isvtp: true, items: sourceItems }, visible: true, sorter: false },
            { field: "target", title: "目标列名", type: "string", comvtp: { isvtp: true, items: targetItems }, visible: true, sorter: false },
            { field: "defaultValue", title: "默认值", type: "string", visible: true, sorter: false },
            { field: "foreignMap", title: "外关联映射", type: "string", visible: true, sorter: false }
        ]
        setSourceTotargetMapTable({
            model: { fields: items, isadd: false, isedit: true, isremove: false },
            rows: data,
            total: data.length
        })
    }


    function mapExcelToData(excelRow) {
        var row = null
        for (var ii in sourceTotargetMapTable.rows) {
            var stmap = sourceTotargetMapTable.rows[ii]
            var sfield = sourceTable.model?.fields[stmap.source]
            if ((sfield == undefined || sfield == null) && stmap.defaultValue == "")
                continue
            var titem = targetFields[stmap.target]
            if (titem == undefined || titem == null)
                continue
            if (row == null)
                row = {}
            if (stmap.defaultValue != null && stmap.defaultValue != "") {
                row[titem.field] = stmap.defaultValue
                continue
            }
            var sn = sfield.field
            var value = stmap.defaultValue == "" ? excelRow[sn] : stmap.defaultValue
            if (titem?.comvtp && titem.comvtp.isvtp) {
                for (let item of titem.comvtp.items.entries()) {
                    if (value == item[1]) {
                        value = item[0]
                        break
                    }
                }
            }
            row[titem.field] = value
        }
        return row
    }
    function startImportData() {
        if (upfileResult == null || upfileResult.data == undefined) {
            Modal.error({
                content: <div>导入数据未上传，不能导入！</div>
            })
            return
        }
        const { data } = upfileResult
        if (sourceTotargetMapTable.rows.length <= 0) {
            Modal.error({
                content: <div>Excel于数据映射关系未设置不能导入！</div>
            })
            return
        }
        for (var i = importCount; i < data.length; i++) {
            if (stopImport) break
            var row = mapExcelToData(data[i])
            if (row != null) {
                if (!submitData(row))
                    break
            }
        }
    }
    function submitData(row: any) {
        if (props.onAdd) {
            setImportState({ message: "导入进行中", description: JSON.stringify(row), type: 'info' })
            var result = props.onAdd("add", row)
            if (result != undefined && result.success) {
                setImportCount(importCount + 1)
                setImportState({ message: "导入成功", description: JSON.stringify(row), type: 'success' })
                return true
            } else {
                setStopImport(true)
                importError(row, result.message)
                return false
            }
        }
    }
    function importError(row, message) {
        var prop = {
            message: "导入出错:" + JSON.stringify(row),
            description: message,
            type: 'error',
            action: (
                <Space>
                    <Button size="small" type="ghost" onClick={() => {
                        console.log("importform.edit")
                        if (props.form) {
                            console.log("importform.edit1")
                            var form = props.form
                            form.clear()
                            form.setHideSearch(true)
                            form.setTitle(props.title)
                            form.show()
                            form.setValues(row)
                            form.onFinish = (values) => {
                                console.log(values)
                                form.hide()
                                if (submitData(values)) {
                                    setStopImport(false)
                                    startImportData()
                                }
                            }
                        }
                    }}>修改</Button>
                </Space>)
        }
        setImportState(prop)
    }
    function renderUpfile() {
        const upfile = {
            name: 'file',
            accept: '.xlsx, .xls',
            onChange(info: any) {
                console.log(info)

                // 通过FileReader对象读取文件
                const fileReader = new FileReader();
                fileReader.onload = event => {
                    try {
                        const { result } = event.target
                        // 以二进制流方式读取得到整份excel表格对象
                        const workbook = XLSX.read(result, { type: 'binary' });
                        // 存储获取到的数据
                        let data: any = [];
                        // 遍历每张工作表进行读取（这里默认只读取第一张表）
                        for (const sheet in workbook.Sheets) {
                            // esline-disable-next-line
                            if (workbook.Sheets.hasOwnProperty(sheet)) {
                                // 利用 sheet_to_json 方法将 excel 转成 json 数据
                                data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                                break; // 如果只取第一张表，就取消注释这行
                            }
                        }
                        // 最终获取到并且格式化后的 json 数据
                        var res = { data: data, rowcount: data.length }
                        setUpfileResult(res)
                        setshowtable(res)
                    } catch (e) {
                        // 这里可以抛出文件类型错误不正确的相关提示
                        message.error('发生错误！');
                        console.log(e)
                    }
                };
                // 以二进制方式打开文件
                fileReader.readAsBinaryString(info.file.originFileObj);
            },
        };
        return (<Card >
            <Row gutter={[8, 8]}><Col span={24}>
                <Alert showIcon message={`上传文件中的数据为${rowcount}行`} type={"info"} action={
                    <Space>
                        <Button size="small" type="primary" >下载导入模板</Button>
                    </Space>
                } />
            </Col>
            </Row>
            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Dragger  {...upfile}>
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">点击或拖拽文件上传</p>
                    </Dragger>
                </Col></Row>
            <Row gutter={[8, 8]}><Col span={24}><WayTable isclosecard={true} attr={sourceTable.model} data={sourceTable.data}></WayTable></Col></Row>
            <Row gutter={[8, 8]}><Col span={24} push={11}><Button type="primary" disabled={rowcount < 1} onClick={() => { setCurrentStep(currentStep + 1) }}>下一步</Button></Col></Row>
        </Card>
        )
    }
    function renderMapTable() {
        var prop = {
            isselect: false,
            closesearch: true,
            closetoolbar: true,
            closecard: true,
            model: sourceTotargetMapTable.model,
            data: { rows: sourceTotargetMapTable.rows, total: sourceTotargetMapTable.total },
            onDataChange: (data: any) => {
                setSourceTotargetMapTable({
                    ...sourceTotargetMapTable,
                    rows: data.rows
                })
            },
            onGetFieldToEdit: (field: WayFieldAttribute, row: any) => {
                if (field.field == 'defaultValue') {
                    var index = row["target"]
                    var tfield = targetFields[index]
                    //tfield.field = field.field
                    return tfield
                }
                return field
            },
            onEditRowing: (row, field, value) => {
                console.log(field)
                var index = row["target"]
                var tfield = targetFields[index]
                if (field == tfield.field) {
                    row['defaultValue'] = value
                }
                console.log(row)
                console.log(value)
                return true
            },
            onSearchData: props.onSearchData
        }
        return (<>
            <Row gutter={[16, 16]}><Col span={24}><WayEditTable {...prop}></WayEditTable></Col></Row>
            <Row gutter={[16, 16]}>
                <Col span={12} push={10}><Button type="primary" onClick={() => { setCurrentStep(currentStep + 1) }}>下一步</Button></Col>
                <Col span={12} push={1}><Button onClick={() => { setCurrentStep(currentStep - 1) }}>上一步</Button></Col>
            </Row>
        </>)
    }
    function renderImportData() {
        return (
            <>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Alert message={`数据导入中，总需要导入${rowcount}行，已导入${importCount}行`} type="info" />
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Progress percent={(importCount % rowcount) * 100} status="active" />
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Alert {...importState} />
                </Col></Row>
                <Row gutter={[8, 8]}>
                    <Col span={12} push={10}><Button type="primary" disabled={stopImport} onClick={() => { startImportData() }}>开始导入</Button></Col>
                    <Col span={12} push={1}><Button onClick={() => { setCurrentStep(currentStep - 1) }}>上一步</Button></Col>
                </Row>
            </>)
    }
    function render() {
        return (<WayStepFrom title={`导入${props.title}数据`} closeOk={true} isModal={true} isShow={isshow} stepItem={stepItem()} currentStep={currentStep}
            onChange={(current) => {
                if (current == 1)
                    mapFileToData()
                setCurrentStep(current)
            }}
            onCurrentStepComponent={(current) => {
                if (current == 0)
                    return renderUpfile()
                if (current == 1)
                    return renderMapTable()
                if (current == 2)
                    return renderImportData()
                return (<></>)
            }}
            onShowChange={(show) => {
                setModalShow(show)
                if (props.onShowChange)
                    props.onShowChange(show)
                if (!show) {
                    clearstate()
                }
            }}
        ></WayStepFrom>)
    }
    return (render())
}
export default ImportForm;