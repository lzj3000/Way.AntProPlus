import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Card, Modal, Tabs } from 'antd';
import { ChildModelAttribute, ModelAttribute, SearchItem, TableData, WayFieldAttribute } from '../Attribute'
import WayTextBox, { WayTextBoxProps } from '../WayTextBox'
import { FormItemProps, FormInstance } from 'antd/lib/form';
import WayEditTable from './edittable';


const TabPane = Tabs.TabPane

export interface FormPlus extends FormInstance<any> {
    setFieldDisabled: (fieldName: string, disabled: boolean) => void,
    setTitle: (title: string) => void,
    setValues: (values: any) => void,
    show: () => void,
    clear: () => void,
}

interface WayFromProps {
    attr: ModelAttribute
    title?: string
    ismodal?: boolean
    modaltype?: string | 'modal' | 'drawer'
    isshow?: boolean,
    values?: any,
    onInitItem?: (field: WayFieldAttribute, item: FormItemProps) => void
    onInitTextBox?: (field: WayFieldAttribute, txtprops: WayTextBoxProps) => void,
    onInitChildItems?: (model: ChildModelAttribute, item: FormItemProps) => void,
    onInitFormed?: (form: FormPlus) => void,
    onFinish?: (values: any) => void,
    onFinishFailed?: (errorInfo: any) => void,
    onFieldsChange?: (changedFields: any[], allFields: any[]) => void,
    onValuesChange?: (changedValues: any, values: any) => void,
    onFieldRules?: (field: WayFieldAttribute, rules: any[]) => [],
    onSearchData?: (item: SearchItem) => TableData
}

const WayFrom: React.FC<WayFromProps> = (props) => {
    const [form] = Form.useForm()
    const [title, setTitle] = useState(props.title)
    const [isshow, setModalShow] = useState(props.isshow ?? false)
    const [formModel, setFormModel] = useState({
        items: props.attr.fields?.filter((field) => { return field.visible && field.isedit }),
        models: props.attr.childmodels?.filter((m) => { return m.visible })
    })
    const [edittable, setEditTable] = useState<TableData>({ rows: [], total: 0 })
    useEffect(() => {
        if (props.values != undefined) {
            setFormValues(props.values)
        } else {
            clearFormValues()
        }
    }, [props.values])
    function setForm() {
        const children: JSX.Element[] = [];
        formModel.items?.forEach((field) => {
            var item: FormItemProps = fieldToItemProps(props.attr, field)
            var txtprops: WayTextBoxProps = { options: { placeholder: item.label } }
            if (props.onInitTextBox != undefined) {
                props.onInitTextBox(field, txtprops)
            }
            children.push(
                <Col span={8}>
                    <Form.Item {...item}>
                        <WayTextBox {...txtprops} attr={field} />
                    </Form.Item>
                </Col>
            )
        })
        if (props.onInitFormed != undefined) {
            form.setFieldDisabled = (fieldName: string, disabled: boolean) => {
                formModel.items?.forEach((item) => {
                    if (item.field?.toLocaleLowerCase() == fieldName.toLocaleLowerCase())
                        item.disabled = disabled
                })
                setFormModel(formModel)
            }
            form.setTitle = (title: string) => {
                setTitle(title)
            }
            form.show = () => {
                setModalShow(true)
            }
            form.setValues = (values: any) => {
                setFormValues(values)
            }
            form.clear = () => {
                clearFormValues()
            }
            props.onInitFormed(form)
        }
        return children
    }
    function setFormValues(values: any) {
        form.setFieldsValue(values)
        if (formModel.models != undefined && formModel.models?.length > 0) {
            var cm = formModel.models[0]
            if (values[cm.name] != undefined) {
                var rows = values[cm.name]
                setEditTable({ rows: rows, total: rows.length })
            }
        }
    }
    function clearFormValues() {
        form.resetFields()
        setEditTable(null)
    }
    function fieldToItemProps(model: ModelAttribute, field: WayFieldAttribute): FormItemProps {
        var item: FormItemProps = {}
        item.name = field.field
        item.label = field.title
        if (!field.disabled)
            item.rules = fieldGetRules(field)
        if (props.onInitItem != undefined) {
            props.onInitItem(field, item)
        }
        return item
    }
    function fieldGetRules(field: WayFieldAttribute) {
        var rules = []
        if (field.required)
            rules.push({ required: field.required })
        if (field.length ?? 0 > 0)
            rules.push({ len: field.length })
        if (props.onFieldRules != undefined)
            rules = props.onFieldRules(field, rules)
        return rules
    }
    const formhtml = () => {
        return (<Form form={form}
            onFinish={props.onFinish}
            scrollToFirstError={true}
            initialValues={props.values}
        ><Row gutter={24}>{setForm()}</Row></Form>)
    }
    const childhtml = () => {
        if (formModel.models != undefined && formModel.models?.length > 0) {
            return (<Tabs defaultActiveKey={"0"} onChange={(actioveKey) => {

            }}>
                {formModel.models?.map((cm, index) => {
                    return (
                        <TabPane tab={cm.title} key={index}>
                            <WayEditTable model={cm} data={edittable} iscirclebutton={true} closetoolbar={false} onSearchData={(item) => {
                                if (props.onSearchData != undefined) {
                                    item.parent = form.getFieldsValue()
                                    item.childmodel = cm
                                    var data = props.onSearchData(item)
                                    setEditTable(data)
                                }
                            }}
                                onAddRowing={(row) => {
                                    return true
                                }}
                                onAdded={(row) => {

                                }}
                                onEditRowing={(row, field, value) => {
                                    return true
                                }}
                                onRemoveRowing={(row) => {
                                    return true
                                }}
                                onRemoveed={(row) => {

                                }}
                            ></WayEditTable>
                        </TabPane>
                    )
                })}
            </Tabs>)
        }
    }
    const html = () => {
        if (props.ismodal) {
            return (<Modal title={title} width={1000} visible={isshow} onCancel={() => setModalShow(false)} onOk={() => {
                form.submit()
            }}>
                <Card>{formhtml()}</Card>
                {childhtml()}
            </Modal>)
        } else {
            return (<><Card title={title}>{formhtml()}</Card>{childhtml()}</>)
        }
    }
    return (
        html()
    )
}

export default WayFrom;