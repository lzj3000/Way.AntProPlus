import React, { useEffect, useRef, useState } from 'react';
import useMergeValue from 'use-merge-value';

import { DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import moment from 'moment';
import { isArray, isMap, isNumber } from 'lodash';
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
    onSearchValueChange?: (obj: any) => void
}
const WayTextBox: React.FC<WayTextBoxProps> = (props) => {
    const [defaultProps, setDefaultProps] = useState(() => {
        return gettextProps()
    })
    const [searchModal, setSearchModal] = useState({
        isshow: false,
        model: undefined,
        data: undefined,
    })
    const [searchValue, setSearchValue] = useState({
        row: undefined,
        value: '',
        text: '',
        rowfield: ''
    })
    useEffect(() => {
        setDefaultProps(gettextProps())
    }, [props.options])
    useEffect(() => {
        if (searchValue.row != undefined) {
            setSearchRowToValue(null)
        }
        setDefaultProps(gettextProps())
    }, [props.attr])
    useEffect(() => {
        console.log(value)
        if (props.attr?.foreign != undefined && props.attr.foreign.isfkey && props.children != undefined) {
            if (searchValue.row == undefined && props.value != undefined) {
                var row = props.children[props.attr.foreign.oneobjecfiled.toLocaleLowerCase()]
                setSearchRowToValue(row)
            }
        }
    }, [props.value])
    function gettextProps() {
        var prop = {
            autoFocus: false,
            maxLength: 500,
            prefix: '',
            size: 'middle',
            suffix: '',
            type: 'text',
            allowClear: true,
            placeholder: '',
            disabled: props.disabled ?? false,
            style: { width: '100%' },
            texttype: TextType.Input
        }
        for (var n in prop) {
            if (props.options != undefined && props.options[n] != undefined) {
                prop[n] = props.options[n]
            }
        }
        if (props.width != undefined)
            prop.style.width = props.width
        prop.texttype = getTextType(prop)
        return prop
    }
    function getTextType(prop): TextType {
        var { textType, attr } = props
        if (attr != undefined) {
            if (attr.type == "int" || attr.type == "int32" || attr.type == "int64" || attr.type == "decimal") {
                textType = TextType.InputNumber
                if (attr.pointlength != undefined && attr.pointlength > 0) {
                    prop.precision = attr.pointlength
                }
            }
            if (attr.type == "datetime") {
                textType = TextType.DatePicker
            }
            if (attr.type == "boolean") {
                textType = TextType.Switch
                if (props.search) {
                    textType = TextType.Select
                    var items: { label: string; value: boolean; }[] = [{ label: '是', value: true }, { label: '否', value: false }]
                    prop.options = items
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
                prop.options = items
            }
            if (attr.foreign != undefined && attr.foreign.isfkey) {
                textType = TextType.Search
            }
            if (attr.length != undefined && attr.length > 0)
                prop.maxLength = attr.length
            if (props.disabled == undefined && attr.disabled != undefined) {
                prop.disabled = attr.disabled
            }
            if (props.search) {
                prop.disabled = false
            }
        }
        if (textType == undefined) {
            textType = TextType.Input;
        }
        return textType
    }
    const [value, setValue] = useMergeValue<any | undefined>(props.defaultValue, {
        value: anyToObject(props.value),
        onChange: (value, prevValue) => {
            console.log(value)
            if (props.onChange != undefined) {
                var vvv = anyToString(value)
                props.onChange(vvv)
            }
        },
    });
    function anyToObject(value: any) {
        console.log(value)
        switch (defaultProps.texttype) {
            case TextType.InputNumber:
                if (isNumber(value)) {
                    return Number(value)
                }
                return null
            case TextType.DatePicker:
                if (value == null || value == undefined)
                    return null
                if (typeof value == "string") {
                    if (value == '')
                        return null
                    return moment(value, 'YYYY-MM-DD')
                } else {
                    if (!isArray(value))
                        return moment(value)
                }
        }
        return value
    }
    function anyToString(value: any) {
        switch (defaultProps.texttype) {
            case TextType.DatePicker:
                if (value != null || value != undefined) {
                    if (!isArray(value))
                        return value.format('YYYY-MM-DD').toString()
                }
                return value
            case TextType.InputNumber:
                if (value == null)
                    return null
                if (!isNumber(value))
                    return 0
                return Number(value)
        }
        return value
    }
    function setSearchRowToValue(row: any) {
        var obj = { value: '', text: '', row: undefined, rowfield: '' }
        if (row) {
            var valueProp: String = props.attr?.foreign?.oneobjecfiledkey ?? ""
            var textProp: string = props.attr?.foreign?.onedisplayname.toLocaleLowerCase() ?? ""
            obj.row = row
            obj.value = row[valueProp.toLocaleLowerCase()]
            obj.text = row[textProp.toLocaleLowerCase()]
            obj.rowfield = props.attr?.foreign?.oneobjecfiled.toLocaleLowerCase() ?? ""
        }
        setSearchValue(obj)
        setValue(obj.value)
        if (props.onSearchValueChange)
            props.onSearchValueChange(obj)
    }
    function renderSearch() {
        return (<><Search
            {...defaultProps}
            size={'middle'}
            value={searchValue.text}
            onSearch={(value) => {
                if (props.onSearchBefore != undefined) {
                    var item = { foreign: props.attr?.foreign, value: value, field: props.attr }
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
                    var sm = { ...searchModal }
                    sm.isshow = isshow
                    setSearchModal(sm)
                    setSearchRowToValue(row)
                }}
                onSearchData={(item: SearchItem, callback) => {
                    item.field = props.attr
                    item.foreign = props.attr?.foreign
                    if (props.onSearchData != undefined) {
                        props.onSearchData(item, callback)
                    }
                }}
            ></WayEditTable></>
        )
    }
    function renderSelect() {
        return (<Select
            {...defaultProps}
            size={'middle'}
            value={value}
            onChange={setValue}
        >
        </Select>)
    }
    function renderBool() {
        return (<Switch
            size={'default'}
            checked={value}
            onChange={setValue}></Switch>
        )
    }
    function renderDate() {
        if (props.search) {
            return (<RangePicker
                size={'middle'}
                style={defaultProps.style}
                value={value}
                allowEmpty={[true, true]}
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
            </DatePicker>)
        }
    }
    function renderNumber() {
        return (<InputNumber
            {...defaultProps}
            size={'middle'}
            value={value}
            precision={props.attr?.pointlength}
            onChange={setValue}>
        </InputNumber>);
    }
    function render() {
        switch (defaultProps.texttype) {
            case TextType.InputNumber:
                return renderNumber()
            case TextType.DatePicker:
                return renderDate()
            case TextType.Switch:
                return renderBool()
            case TextType.Select:
                return renderSelect()
            case TextType.Search:
                return renderSearch()
        }
        return (<Input {...defaultProps} size={'middle'} value={value}
            onChange={(event: any) => {
                setValue(event.target.value)
            }}
        >
        </Input>);
    }
    return (render())
}
export default WayTextBox;