import { UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Col, message, Progress, Row, Upload } from 'antd';
import { StepProps } from 'antd/lib/steps';
import React, { useEffect, useState } from 'react';
import WayStepFrom from '../WayForm/stepform';
import { Typography } from 'antd';
import WayTable from '.';
import { ModelAttribute, WayFieldAttribute } from '../Attribute';
import WayEditTable from '../WayForm/edittable';
import * as XLSX from 'xlsx';

const { Title } = Typography;

interface ImportFormProps {
    isShow: boolean
}

const ImportForm: React.FC<ImportFormProps> = (props) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isshow, setModalShow] = useState(props.isShow ?? false)
    const [isonetable, setIsOneTable] = useState(false)
    const [rowcount, setRowCount] = useState(0)
    const [sourceTable, setSourceTable] = useState({ model: undefined, data: { rows: [], total: 0 } })
    const [targetFields, setTargetFields] = useState<WayFieldAttribute[]>([])
    const [importCount, setImportCount] = useState(0)
    var upfileResult: any = null
    var sourceTotargetMapTable: any = null
    useEffect(() => {
        setModalShow(props.isShow)
    }, [props.isShow])
    function stepItem() {
        var step1: StepProps = { title: "上传导入文件", description: "支持Excel文件导入" }
        var step2: StepProps = { title: "设置导入映射", description: "从Excel文件中获取的数据，设置Excel列对应到要导入的数据列，可以设置导入时的相关规则" }
        var step3: StepProps = { title: "导入数据过程", description: "导入数据中，错误或中断请获取中止文件处理后，重新上传导入" }
        var step4: StepProps = { title: "完成", description: "" }
        var items: StepProps[] = [step1, step2, step3, step4]
        return items
    }
    function getattr(table: any[]): ModelAttribute {
        var attr: ModelAttribute = { fields: [] }
        if (table.length > 0) {
            for (var n in table[0]) {
                attr.fields?.push({ field: n, title: n, type: "string" })
            }
        }
        return attr
    }
    function setshowtable(isonetable) {
        const { rowcount, table, onetable } = upfileResult
        if (rowcount > 0) {
            if (isonetable) {
                setRowCount(rowcount - 1)
                setSourceTable({ model: getattr(onetable), data: { rows: onetable, total: onetable.length } })
            }
            else {
                setRowCount(rowcount)
                setSourceTable({ model: getattr(table), data: { rows: table, total: table.length } })
            }
        }
    }
    function getUpfile() {
        const upfile = {
            name: 'file',
            accept: '.xlsx, .xls',
            onChange(info: any) {
                // 获取上传的文件对象
                const { files } = info.target;
                // 通过FileReader对象读取文件
                const fileReader = new FileReader();
                fileReader.onload = event => {
                    try {
                        const { result } = event.target;
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
                        let rows = data.length > 11 ? 11 : data.length
                        let table: any[] = []
                        let onetable: any[] = []
                        for (var i = 0; i < rows - 1; i++) {
                            table.push(data[i])
                            onetable.push(data[i + 1])
                        }
                        upfileResult = { data: data, rowcount: data.length, table, onetable }
                        setshowtable(isonetable)
                    } catch (e) {
                        // 这里可以抛出文件类型错误不正确的相关提示
                        message.error('发生错误！');
                        console.log(e)
                    }
                };
                // 以二进制方式打开文件
                fileReader.readAsBinaryString(files[0]);
            },
        };
        return (<Card ><Row gutter={[16, 16]}><Col span={24}>
            <Upload style={{ width: "100%" }} {...upfile}>
                <Button icon={<UploadOutlined />}>点击上传导入文件</Button>
            </Upload>
        </Col></Row>
            <Row gutter={[16, 16]}>
                <Col span={12}><Checkbox style={{ width: "100%" }} checked={isonetable} onChange={(e) => {
                    setIsOneTable(e.target.checked)
                    setshowtable(e.target.checked)
                }}>第一行是否为表头列</Checkbox></Col>
                <Col span={12}><Title style={{ width: "100%" }} level={5}>上传文件中的数据为{rowcount}行</Title></Col></Row>
            <Row gutter={[16, 16]}><Col span={24}><WayTable attr={sourceTable.model} data={sourceTable.data}></WayTable></Col></Row>
            <Row gutter={[16, 16]}><Col span={24}><Button type="primary" disabled={rowcount < 1} onClick={() => { setCurrentStep(currentStep + 1) }}>下一步</Button></Col></Row>
        </Card>
        )
    }
    function mapFileToData() {
        var sourceItems = new Map<number, string>()
        sourceTable.model?.fields?.forEach((field, index) => {
            sourceItems.set(index, field.title)
        })
        var targetItems = new Map<number, string>()
        var data: any = []
        targetFields.forEach((field, index) => {
            targetItems.set(index, field.title)
            var sourcefield = sourceTable.model?.fields?.Find((sf) => {
                return sf.field == field.field || sf.field == field.title
            })
            if (sourcefield == undefined || sourcefield == null) {
                sourcefield = sourceTable.model?.fields[index]
            }
            var fm = (field.foreign && field.foreign.isfkey) ? "Name" : ""
            data.push({ source: sourcefield.field, target: field.title, defaultValue: "", foreignMap: fm, editable: true })
        })
        var items = [
            { field: "source", title: "来源列名", type: "string", comvtp: { isvtp: true, items: sourceItems } },
            { field: "target", title: "目标列名", type: "string", comvtp: { isvtp: true, items: targetItems } },
            { field: "defaultValue", title: "默认值", type: "string" },
            { field: "foreignMap", title: "外关联映射", type: "string" }
        ]
        var prop = {
            closesearch: true,
            closetoolbar: true,
            model: { fields: items, isadd: false, isedit: true, isremove: false },
            data: { rows: data, total: data.length },
            onDataChange: (data: any) => {
                sourceTotargetMapTable = data
            }
        }
        return (<>
            <Row gutter={[16, 16]}><Col span={24}><WayEditTable {...prop}></WayEditTable></Col></Row>
            <Row gutter={[16, 16]}>
                <Col span={12}><Button type="primary" onClick={() => { setCurrentStep(currentStep + 1) }}>下一步</Button></Col>
                <Col span={12}><Button onClick={() => { setCurrentStep(currentStep - 1) }}>上一步</Button></Col>
            </Row>
        </>)
    }
    function importData() {
        return (
            <>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Title level={4}>数据导入中，总需要导入{rowcount}行，已导入{importCount}行</Title>
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Progress percent={(importCount % rowcount) * 100} status="active"/>
                </Col></Row>
                <Row gutter={[16, 16]}><Col span={24}>
                    <Alert
                        message="Success Text"
                        description="Success Description Success Description Success Description"
                        type="success"
                    />
                </Col></Row>
            </>)
    }
    function render() {
        return (<WayStepFrom isModal={true} isShow={isshow} stepItem={stepItem()} currentStep={currentStep}
            onChange={(current) => {
                setCurrentStep(current)
                switch (current) {
                    case 0:
                        break
                    case 1:
                        break
                    case 2:
                        break
                    case 3:
                        break

                }
            }}
            onCurrentStepComponent={(current) => {
                if (current == 0)
                    return (getUpfile())
                if (current == 1)
                    return (mapFileToData())
                if (current == 2)
                    return (importData())
                return(<></>)
            }}
        ></WayStepFrom>)
    }
    return (render())
}
export default ImportForm;