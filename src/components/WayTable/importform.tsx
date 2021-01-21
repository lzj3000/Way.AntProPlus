import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Col, message, Progress, Row, Space, Upload } from 'antd';
import { StepProps } from 'antd/lib/steps';
import React, { useEffect, useState } from 'react';
import WayStepFrom from '../WayForm/stepform';
import { Typography } from 'antd';
import WayTable from '.';
import { ModelAttribute, WayFieldAttribute } from '../Attribute';
import WayEditTable from '../WayForm/edittable';
import * as XLSX from 'xlsx';
import Dragger from 'antd/lib/upload/Dragger';

const { Title } = Typography;

interface ImportFormProps {
    title?: string
    isShow: boolean
    attr: ModelAttribute
    onAdd?: any
}

const ImportForm: React.FC<ImportFormProps> = (props) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isshow, setModalShow] = useState(props.isShow ?? false)
    const [isonetable, setIsOneTable] = useState(false)
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

    const [sourceTotargetMapTable,setSourceTotargetMapTable]=useState([])

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
        var step1: StepProps = { title: "上传导入文件" }
        var step2: StepProps = { title: "设置导入映射" }
        var step3: StepProps = { title: "导入数据" }
        var items: StepProps[] = [step1, step2, step3]
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
    function getUpfile() {
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
                <Alert showIcon message={`上传文件中的数据为${rowcount}行`} type={"info"} />
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
    var sourceItems = new Map<number, string>()
    var targetItems = new Map<number, string>()
    //todo:绑定异常
    function mapFileToData() {
        sourceTable.model?.fields?.forEach((field, index) => {
            sourceItems.set(index, field.title)
        })
        var data: any = []
        targetFields.forEach((field, index) => {
            targetItems.set(index, field.title)
            var sourcefield = sourceTable.model?.fields?.find((sf) => {
                return sf.field == field.field || sf.field == field.title
            })
            if (sourcefield == undefined || sourcefield == null) {
                sourcefield = sourceTable.model?.fields[index]
            }
            var fm = (field.foreign && field.foreign.isfkey) ? "Name" : ""
            data.push({ id: index, source: index, target: index, defaultValue: "", foreignMap: fm })
        })
        var items = [
            { field: "source", title: "来源列名", type: "string", comvtp: { isvtp: true, items: sourceItems }, visible: true, sorter: false },
            { field: "target", title: "目标列名", type: "string", comvtp: { isvtp: true, items: targetItems }, visible: true, sorter: false },
            { field: "defaultValue", title: "默认值", type: "string", visible: true, sorter: false },
            { field: "foreignMap", title: "外关联映射", type: "string", visible: true, sorter: false }
        ]
        var prop = {
            isselect: false,
            closesearch: true,
            closetoolbar: true,
            model: { fields: items, isadd: false, isedit: true, isremove: false },
            data: { rows: sourceTotargetMapTable, total: sourceTotargetMapTable.length },
            onDataChange: (data: any) => {
                setSourceTotargetMapTable(data)
            }
        }
        setSourceTotargetMapTable(data)
        return (<>
            <Row gutter={[16, 16]}><Col span={24}><WayEditTable {...prop}></WayEditTable></Col></Row>
            <Row gutter={[16, 16]}>
                <Col span={12}><Button type="primary" onClick={() => { setCurrentStep(currentStep + 1) }}>下一步</Button></Col>
                <Col span={12}><Button onClick={() => { setCurrentStep(currentStep - 1) }}>上一步</Button></Col>
            </Row>
        </>)
    }
    var stopImport: boolean = false
    function startImportData() {
        console.log(upfileResult)
        const { data } = upfileResult
        for (var i = importCount; i < data.length; i++) {
            if (!stopImport) {
                var row = {}
                console.log(sourceTotargetMapTable)
                for (var stmap in sourceTotargetMapTable) {
                    var sn = sourceItems.get(stmap.source)
                    var titem = targetFields.find(f => f.title == targetItems.get(stmap.target))
                    var value = stmap.defaultValue == "" ? data[startImportIndex][sn] : stmap.defaultValue
                    if (titem?.comvtp && titem.comvtp.isvtp) {
                        for (let item of titem.comvtp.items.entries()) {
                            if (value == item[1]) {
                                value = item[0]
                                break
                            }
                        }
                    }
                    row[titem.field] = value
                    console.log(row)
                    if (props.onAdd) {
                        setImportState({
                            message: "导入进行中",
                            description: JSON.stringify(row),
                            type: 'info'
                        })
                        props.onAdd("add", row).then((result) => {
                            if (result != undefined && result.success) {
                                setImportCount(importCount + 1)
                                setImportState({
                                    message: "导入成功",
                                    description: '',
                                    type: 'success'
                                })
                            } else {
                                stopImport = true
                                setImportState({
                                    message: "导入出错",
                                    description: result.message,
                                    type: 'error'
                                })
                            }
                        })
                    }
                }
            } else
                break
        }
    }
    function importData() {
        return (
            <>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Alert showIcon message={`数据导入中，总需要导入${rowcount}行，已导入${importCount}行`} type={"info"}
                        action={
                            <Space>
                                <Button size="small" type="primary" onClick={() => startImportData()}>开始</Button>
                                <Button size="small" danger type="ghost">清除</Button>
                            </Space>
                        }
                    />
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Progress percent={(importCount % rowcount) * 100} status="active" />
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Alert
                        message={importState.message}
                        description={importState.description}
                        type={importState.type}
                    />
                </Col></Row>
            </>)
    }
    function render() {
        return (<WayStepFrom title={`导入${props.title}数据`} isModal={true} isShow={isshow} stepItem={stepItem()} currentStep={currentStep}
            onCurrentStepComponent={(current) => {
                if (current == 0)
                    return (getUpfile())
                if (current == 1)
                    return (mapFileToData())
                if (current == 2)
                    return (importData())
                return (<></>)
            }}
        ></WayStepFrom>)
    }
    return (render())
}
export default ImportForm;