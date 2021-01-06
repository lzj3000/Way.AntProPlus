import React, { useEffect, useRef, useState } from 'react';
import useMergeValue from 'use-merge-value';

import { DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import moment from 'moment';
import { isMap, isNumber } from 'lodash';
import { ModelAttribute, SearchItem, TableData, WayFieldAttribute } from '../Attribute'
import WayEditTable from '../WayForm/edittable';




const { RangePicker } = DatePicker;
const { Search } = Input;

export enum TextType {
    Input = "Input",
    TextArea = "Input.TextArea",
    InputNumber = "InputNumber",
    Switch = "Switch",
    DatePicker = "DatePicker",
    RangePicker = "RangePicker",
    Search = "Input.Search",
    Avatar = "Avatar",
    Select = "Select",
}


export interface WayTextBoxProps {
    attr?: WayFieldAttribute;
    textType?: TextType;
    type?: string | 'checkbox' | 'color' | 'date' | 'datetime' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'tel' | 'text' | 'time' | 'url' | 'week';
    name?: string;
    search?: boolean;
    defaultValue?: string;
    value?: any;
    disabled?: boolean;
    options?: any;
    width?: string;
    onChange?: (value: any) => void;
    onPressEnter?: (value: any) => void;
    onSearchBefore?: (item: SearchItem, callback: (model: ModelAttribute, data: TableData) => void) => void
    onSearchData?: (item: SearchItem, callback: (data: TableData) => void) => void
}
const WayTextBox: React.FC<WayTextBoxProps> = (props) => {
    const [searchModal, setSearchModal] = useState({
        isshow: false,
        model: undefined,
        data: undefined,
        value: '',
        text: ''
    })

    const defaultProps = {
        autoFocus: false,
        maxLength: 500,
        prefix: '',
        size: 'middle',
        suffix: '',
        type: 'text',
        allowClear: true,
        placeholder: '',
        disabled: props.disabled ?? false,
        style: { width: '100%' }
        // onPressEnter: (event: any) => {
        //     if (props.onPressEnter != undefined)
        //         props.onPressEnter(event.currentTarget.value)
        // }

    }
    for (var n in defaultProps) {
        if (props.options != undefined && props.options[n] != undefined) {
            defaultProps[n] = props.options[n]
        }
    }
    if (props.width != undefined)
        defaultProps.style.width = props.width
    var { textType, attr } = props
    setTextType(attr);
    function setTextType(attr: WayFieldAttribute | undefined) {
        if (attr != undefined) {
            if (attr.type == "int" || attr.type == "int32" || attr.type == "int64" || attr.type == "decimal") {
                textType = TextType.InputNumber
                if (attr.pointlength != undefined && attr.pointlength > 0)
                    defaultProps["precision"] = attr.pointlength
            }
            if (attr.type == "datetime") {
                textType = TextType.DatePicker
            }
            if (attr.type == "boolean") {
                textType = TextType.Switch
                if (props.search) {
                    textType = TextType.Select
                    var items: { label: string; value: boolean; }[] = [{ label: '是', value: true }, { label: '否', value: false }]
                    defaultProps["options"] = items
                }
            }
            if (attr.comvtp != undefined && attr.comvtp.isvtp) {
                textType = TextType.Select
                var items: { label: string; value: number; }[] = []
                if (!isMap(attr.comvtp.items))
                    attr.comvtp.items = new Map(attr.comvtp.items)
                attr.comvtp.items.forEach((v, k) => {
                    items.push({ label: v, value: k })
                })
                defaultProps["options"] = items
            }
            if (attr.foreign != undefined && attr.foreign.isfkey) {
                textType = TextType.Search
            }
            if (attr.length != undefined && attr.length != 500)
                defaultProps.maxLength = attr.length
            if (props.disabled == undefined && attr.disabled != undefined) {
                defaultProps.disabled = attr.disabled
            }
            if (props.search) {
                defaultProps.disabled = false
            }
        }
        if (textType == undefined) {
            textType = TextType.Input;
        }
    }
    const [value, setValue] = useMergeValue<any | undefined>(props.defaultValue, {
        value: anyToObject(props.value),
        onChange: (value, prevValue) => {
            if (props.onChange != undefined) {
                props.onChange(anyToString(value))
            }
        },
    });
    function anyToObject(value: any) {
        console.log(textType)
        switch (textType) {
            case TextType.InputNumber:
                if (value == null || value == undefined)
                    return null
                if (isNumber(value)) {
                    return Number(value)
                } else return null
            case TextType.DatePicker:
                console.log(value)
                if (value == null || value == undefined)
                    return null
                if (typeof value == "string") {
                    if (value == '')
                        return null
                    if (props.search) {
                        var items = value.split("===")
                        var dates = []
                        items.forEach((d) => {
                            dates.push(moment(d, 'YYYY-MM-DD'))
                        })
                        return dates
                    }
                    return moment(value, 'YYYY-MM-DD')
                } else
                    return moment(value)
        }
        return value
    }
    function anyToString(value: any) {
        switch (textType) {
            case TextType.DatePicker:
                if (value != null || value != undefined) {
                    if (props.search) {
                        return value[0].format('YYYY-MM-DD').toString() + "===" + value[1].format('YYYY-MM-DD').toString()
                    } else
                        return value.format('YYYY-MM-DD').toString()
                }
            case TextType.InputNumber:
                if (value == null)
                    return null
                if (!isNumber(value))
                    return 0

        }
        return value
    }

    switch (textType) {
        case TextType.InputNumber:
            return (<InputNumber
                {...defaultProps}
                size={'middle'}
                value={value}
                precision={props.attr?.pointlength}
                onChange={setValue}>
            </InputNumber>);
        case TextType.DatePicker:
            if (props.search) {
                return (<RangePicker
                    {...defaultProps}
                    size={'middle'}
                    value={value}
                    picker={props.options?.picker}
                    onChange={setValue}>
                </RangePicker>);
            } else {
                return (<DatePicker
                    {...defaultProps}
                    size={'middle'}
                    picker={"date"}
                    value={value}
                    onChange={setValue}>
                </DatePicker>);
            }
        case TextType.Switch:
            return (
                <Switch
                    size={'default'}
                    checked={value}
                    onChange={setValue}></Switch>
            );
        case TextType.Select:
            return (<Select
                {...defaultProps}
                size={'middle'}
                value={value}
                onChange={setValue}
            >
            </Select>);
        case TextType.Search:
            return (<><Search
                {...defaultProps}
                size={'middle'}
                value={value}
                onSearch={(value) => {
                    if (props.onSearchBefore != undefined) {
                        var item = { foreign: attr?.foreign, value: value }
                        props.onSearchBefore(item, (model, data) => {
                            setSearchModal({
                                isshow: true,
                                model: model,
                                data: data
                            })
                        })
                    }
                }}
            >
            </Search>
                <WayEditTable ismodal={true} modelshow={searchModal.isshow} model={searchModal.model} 
                data={searchModal.data} closeedit={true} commandShow={false} selectType={"radio"}
                    onModalChange={(isshow: boolean, row: any) => {
                        var obj = Object.assign({}, searchModal)
                        obj.isshow = isshow
                        if (row != null) {
                            obj.value = row[attr?.foreign?.OneObjecFiledKey]
                            var text = row[attr?.foreign?.OneDisplayName]
                            obj.text = text
                            setValue(text)
                        }
                        setSearchModal(obj)
                    }}
                    onSearchData={(item: SearchItem, callback) => {
                        item.foreign = attr?.foreign
                        item.value = value
                        console.log(item)
                        if (props.onSearchData != undefined) {
                            props.onSearchData(item, callback)
                        }
                    }}
                ></WayEditTable></>
            )
    }
    return (<Input
        {...defaultProps}
        size={'middle'}
        value={value}
        onChange={(event: any) => {
            setValue(event.target.value)
        }}
    >
    </Input>);

}
export default WayTextBox;