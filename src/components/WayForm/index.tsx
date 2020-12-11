import React, { useState } from 'react';
import { Form, Row, Col, Card, Modal } from 'antd';
import { ChildModelAttribute, ModelAttribute, WayFieldAttribute } from '../Attribute'
import WayTextBox, { WayTextBoxProps } from '../WayTextBox'
import { FormItemProps, FormInstance } from 'antd/lib/form';
import { string } from 'prop-types';

export interface FormPlus extends FormInstance<any> {
    setFieldDisabled: (fieldName: string, disabled: boolean) => void,
    setTitle: (title: string) => void,
    show: () => void,
}

interface WayFromProps {
    attr: ModelAttribute
    from?: FormPlus
    title?: string
    ismodal?: boolean
    modaltype?: string | 'modal' | 'drawer'
    isshow?: boolean
    onInitItem?: (field: WayFieldAttribute, item: FormItemProps) => void
    onInitTextBox?: (field: WayFieldAttribute, txtprops: WayTextBoxProps) => void,
    onInitChildItems?: (model: ChildModelAttribute, item: FormItemProps) => void,
    onInitFormed?: (form: FormPlus) => void,
    initialValues?: any,
    onFinish?: (values: any) => void,
    onFinishFailed?: (errorInfo: any) => void,
    onFieldsChange?: (changedFields: any[], allFields: any[]) => void,
    onValuesChange?: (changedValues: any, values: any) => void,
    onFieldRules?: (field: WayFieldAttribute, rules: any[]) => []
}

const WayFrom: React.FC<WayFromProps> = (props) => {
    const [form] = Form.useForm(props.from)
    const [title, setTitle] = useState(props.title)
    const [isshow, setModalShow] = useState(props.isshow ?? false)
    const [formModel, setFormModel] = useState({
        items: props.attr.fields?.filter((field) => { return field.visible && field.isedit }),
        models: props.attr.childmodels?.filter((m) => { return m.visible })
    })
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
            props.onInitFormed(form)
        }
        return children
    }
    function fieldToItemProps(model: ModelAttribute, field: WayFieldAttribute): FormItemProps {
        var item: FormItemProps = {}
        item.name = field.field
        item.label = field.title
        if (props.onInitItem != undefined) {
            props.onInitItem(field, item)
        }
        if (!field.disabled)
            item.rules = fieldGetRules(field)
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
    const html = () => {
        if (props.ismodal) {
            return (<Modal title={title} width={1000} visible={isshow} onCancel={() => setModalShow(false)} onOk={() => {
                form.submit()
            }}>
                <Card ><Form form={form}
                    scrollToFirstError={true}
                    onFinish={props.onFinish}
                    onFinishFailed={props.onFinishFailed}
                    onFieldsChange={props.onFieldsChange}
                    onValuesChange={props.onValuesChange}
                    initialValues={props.initialValues}
                ><Row gutter={24}>{setForm()}</Row></Form></Card>
            </Modal>)
        } else {
            return (<Card title={title}><Form form={form}
                scrollToFirstError={true}
                onFinish={props.onFinish}
                onFinishFailed={props.onFinishFailed}
                onFieldsChange={props.onFieldsChange}
                onValuesChange={props.onValuesChange}
                initialValues={props.initialValues}
            ><Row gutter={24}>{setForm()}</Row></Form></Card>)
        }
    }
    return (
        html()
    )
}

export default WayFrom;