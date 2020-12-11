import React, { useRef } from 'react';
import useMergeValue from 'use-merge-value';

import { DatePicker, Input, InputNumber, Select, Tooltip, Switch, Modal, Space, Avatar, Divider } from 'antd';
import moment from 'moment';
import { isNumber } from 'lodash';
import { WayFieldAttribute } from '../Attribute'



const { RangePicker } = DatePicker;


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
    onChange?: (value: any) => void;
    onPressEnter?: (value: any) => void;
}
const WayTextBox: React.FC<WayTextBoxProps> = (props) => {
    const inputRef = useRef<Input | null>(null);
    const defaultProps = {
        autoFocus: false,
        addonAfter: '',
        addonBefore: '',
        maxLength: 500,
        prefix: '',
        size: 'middle',
        suffix: '',
        type: 'text',
        allowClear: true,
        placeholder: '',
        disabled: props.disabled ?? false,
        style: { width: '100%' },
        onPressEnter: (event: any) => {
            if (props.onPressEnter != undefined)
                props.onPressEnter(event.currentTarget.value)
        }

    }
    for (var n in defaultProps) {
        if (props.options != undefined && props.options[n] != undefined) {
            defaultProps[n] = props.options[n]
        }
    }
    var { textType, attr } = props
    setTextType(attr);
    function setTextType(attr: WayFieldAttribute | undefined) {
        if (attr != undefined) {
            if (attr.foreign != undefined && attr.foreign.isfkey) {
                textType = TextType.Search
            }
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
            }
            if (attr.comvtp != undefined && attr.comvtp.isvtp) {
                textType = TextType.Select
                var items: { label: string; value: number; }[] = []
                attr.comvtp.items.forEach((v, k) => {
                    items.push({ label: v, value: k })
                })
                defaultProps["options"] = items
            }
            if (attr.length != undefined && attr.length != 500)
                defaultProps.maxLength = attr.length
            if (props.disabled == undefined && attr.disabled != undefined) {
                defaultProps.disabled = attr.disabled
            }
        }
        if (textType == undefined) {
            textType = TextType.Input;
        }
    }
    function anyToObject(value: any) {
        switch (textType) {
            case TextType.InputNumber:
                if (value == null || value == undefined)
                    return null
                if (isNumber(value)) {
                    return Number(value)
                } else return null
            case TextType.DatePicker:
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
                } else return null
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
    const [value, setValue] = useMergeValue<any | undefined>(props.defaultValue, {
        value: anyToObject(props.value),
        onChange: (value, prevValue) => {
            if (props.onChange != undefined) {
                props.onChange(anyToString(value))
            }
        },
    });
    switch (textType) {
        case TextType.InputNumber:
            return (<InputNumber
                ref={inputRef}
                {...defaultProps}
                size={'middle'}
                value={value}
                precision={props.attr?.pointlength}
                onChange={setValue}>
            </InputNumber>);
        case TextType.DatePicker:
            if (props.search) {
                return (<RangePicker
                    size={'middle'}
                    picker={"date"}
                    value={value}
                    disabled={props.disabled}
                    style={defaultProps.style}
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
    }
    return (<Input
        ref={inputRef}
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