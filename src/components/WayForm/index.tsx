import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Card, Tabs } from 'antd';
import { ChildModelAttribute, ModelAttribute, SearchItem, TableData, WayFieldAttribute } from '../Attribute'
import WayTextBox, { WayTextBoxProps } from '../WayTextBox'
import { FormItemProps, FormInstance } from 'antd/lib/form';
import WayEditTable from './edittable';
import DragModal from './window';


const TabPane = Tabs.TabPane

export interface FormPlus extends FormInstance<any> {
    setFieldDisabled: (fieldName: string, disabled: boolean) => void,
    setTitle: (title: string) => void,
    setValues: (values: any) => void,
    show: () => void,
    clear: () => void,
    setHideSearch: (isshow: boolean) => void,
    setHideToolbar: (isshow: boolean) => void,
    onFinish?: (values: any) => void
}

interface WayFromProps {
    attr?: ModelAttribute
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
    onFieldRules?: (field: WayFieldAttribute, rules: any[]) => [],
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void
}

const WayFrom: React.FC<WayFromProps> = (props) => {
    const [form] = Form.useForm()
    const [title, setTitle] = useState(props.title)
    const [isshow, setModalShow] = useState(props.isshow ?? false)
    const [formModel, setFormModel] = useState(filterModel(props.attr))
    const [values, setValues] = useState(() => setFormValues(props.values))
    const [closeToolbar, setCloseToolbar] = useState(false)
    const [closeSearch, setCloseSearch] = useState(false)
    useEffect(() => {
        if (props.values != undefined) {
            setValues(setFormValues(props.values))
        } else {
            clearFormValues()
        }
    }, [props.values])
    useEffect(() => {
        setFormModel(filterModel(props.attr))
    }, [props.attr])
    function filterModel(attr) {
        return {
            items: attr?.fields?.filter((field) => { return field.visible && field.isedit }),
            models: attr?.childmodels?.filter((m) => { return m.visible })
        }
    }
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
                        <WayTextBox {...txtprops} attr={field}
                            onSearchBefore={(item, callback) => {
                                if (props.onSearchData != undefined) {
                                    props.onSearchData(item, (data) => {
                                        callback(data.model, data)
                                    })
                                }
                            }} onSearchData={(item, callback) => {
                                if (props.onSearchData) {
                                    props.onSearchData(item, callback)
                                }
                            }} >{values}</WayTextBox>
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
            form.hide=()=>{
                setModalShow(false)
            }
            form.setValues = (values: any) => {
                setValues(setFormValues(values))
            }
            form.clear = () => {
                clearFormValues()
            }
            form.setHideSearch = (isshow: Boolean) => {
                setCloseSearch(isshow)
            }
            form.setHideToolbar = (isshow: Boolean) => {
                setCloseToolbar(isshow)
            }
            props.onInitFormed(form)
        }
        return children
    }
    function setFormValues(values: any) {
        if (values == undefined)
            values = {}
        form.setFieldsValue(values)
        if (formModel.models != undefined && formModel.models?.length > 0) {
            formModel.models.forEach((cm) => {
                if (!values[cm.propertyname]) {
                    values[cm.propertyname] = []
                    values[cm.propertyname].total = 0
                } else {
                    values[cm.propertyname].total = values[cm.propertyname].length
                }
                cm.removeRows = []
            })
        }
        return values
    }

    function clearFormValues() {
        form.resetFields()
        var old = {}
        formModel.models?.forEach((cm) => {
            if (!old[cm.propertyname]) {
                old[cm.propertyname] = []
                old[cm.propertyname].total = 0
            }
        })
        setValues(old)
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
            rules.push({ max: field.length })
        if (props.onFieldRules != undefined)
            rules = props.onFieldRules(field, rules)
        return rules
    }
    const getFormValue = (finishValue: any) => {
        var res = Object.assign({}, values)
        for (var n in finishValue)
            res[n] = finishValue[n]
        if (formModel.models != undefined && formModel.models?.length > 0) {
            formModel.models.forEach((cm) => {
                cm.removeRows?.forEach((row) => {
                    row.state = 3
                    res[cm.propertyname].push(row)
                })
            })
        }
        return res
    }
    function renderForm() {
        return (<Form form={form}
            onFinish={(formvalues) => {
                var res = getFormValue(formvalues)
                if (form.onFinish != undefined) {
                    form.onFinish(res)
                }
                if (props.onFinish != undefined) {
                    props.onFinish(res)
                }
            }}
            scrollToFirstError={true}
            initialValues={props.values}
        ><Row gutter={24}>{setForm()}</Row></Form>)
    }
    function renderChildTables() {
        if (formModel.models != undefined && formModel.models?.length > 0) {
            return (<Tabs defaultActiveKey={"0"}>
                {formModel.models?.map((cm, index) => {
                    return (
                        <TabPane tab={cm.title} key={index}>
                            <WayEditTable model={cm} data={{ rows: values[cm.propertyname], total: values[cm.propertyname]?.total }} iscirclebutton={true} closetoolbar={closeToolbar} closesearch={closeSearch} onSearchData={(item) => {
                                if (props.onSearchData != undefined) {
                                    item.parent = values
                                    item.childmodel = cm
                                    props.onSearchData(item, (data: TableData) => {
                                        var row = Object.assign({}, values)
                                        row[cm.propertyname] = data.rows
                                        row[cm.propertyname].total = data.total
                                        setValues(row)
                                    })
                                }
                            }}
                                onDataChange={(data, row, type) => {
                                    var vvv = Object.assign({}, values)
                                    vvv[cm.propertyname] = data.rows
                                    vvv[cm.propertyname].total = data.total
                                    if (type == 'remove') {
                                        row.forEach((r) => {
                                            if (!r.isnew)
                                                cm.removeRows.push(r)
                                        })
                                    }
                                    setValues(vvv)
                                }}
                            ></WayEditTable>
                        </TabPane>
                    )
                })}
            </Tabs>)
        }
        return (<></>)
    }
    function render() {
        if (props.ismodal) {
            return (<DragModal title={title} width={1000} visible={isshow} onCancel={() => setModalShow(false)} onOk={() => {
                form.submit()
            }}>
                <Card>{renderForm()}</Card>
                {renderChildTables()}
            </DragModal>)
        } else {
            return (<><Card title={title}>{renderForm()}</Card>{renderChildTables()}</>)
        }
    }
    return (render())
}

export default WayFrom;