export interface WayFieldAttribute {
    iskey?: boolean | false;
    field?: string;
    title?: string;
    index?: number;
    disabled?: boolean;
    visible?: boolean;
    isedit?: boolean;
    type?: string;
    required?: boolean;
    length?: number;
    pointlength?: number;//小数长度
    issearch?: boolean;//是否可作为查询条件
    isremark?: boolean;
    tag?: any;
    comvtp?: ComboxAttribute;
    foreign?: ForeignAttribute;
}

export interface ComboxAttribute {
    isvtp: boolean;
    multiple?: boolean;
    items: Map<number,string>;
    eventrow?: any;
}
export interface ForeignAttribute {
    isfkey: boolean;// 是否外键
    OneObjectTypeName: string;// 主对象类型全名程
    OneObjectName: string;// 主对象类型名称
    OneObjecFiled: string;//子对象中的主对象属性名称
    OneObjecFiledKey: string;// 关联到主对象中的属性名程【默认为ID】
    OneObjectForeignKeyValue: string;// 主对象可用的外建值
    ManyObjectTypeName: string;// 子对象类型全名
    ManyObjectName: string;// 子对象的类型名
    ManyObjectFiled: string;// 子对象的属性名 
    ManyObjectFiledKey: string;// 子对象中用于关联外键的属性名
    OneDisplayName: string;// 主对象中需显示的扩展属性名称
    ManyDisplayField: string;// 子对象中扩展显示的属性名，通常为阴影字段名
    MapItems: Map<string, string>;// 主外键对象对应关系，keys中one对象属性名称、Values中为many对象属性名称
    eventrow: any;// 激活外键的主数据行
    isassociate: boolean;// 是否子关联外键
}
export interface ModelAttribute {
    name?: string,
    title?: string,
    disabled?: boolean,
    visible?: boolean,
    fields?: WayFieldAttribute[],
    childmodels?: ChildModelAttribute[]
    commands?: CommandAttribute[]

}
export interface CommandAttribute {
    command: string,
    name: string,
    title?: string,
    isselectrow?: boolean,
    selectmultiple?: boolean,
    isalert?: boolean,
    editshow?: boolean,
    issplit?: boolean,
    splitname?: string,
    disabled?: boolean,
    visible?: boolean,
    onclick?: string,
    icon?: string
}
export interface ChildModelAttribute extends ModelAttribute {
    isadd?: boolean,
    isedit?: boolean,
    isremove?: boolean,
    isselect?: boolean,
    ischeck?: boolean
}
export interface SearchWhere {
    name: string,
    symbol: string,
    value: string
}
export interface SearchItem {
    parent:any,
    childmodel:ChildModelAttribute,
    page: number,
    size: number,
    whereList: SearchWhere[],
    sortList: string[],
}
export interface TableData {
    rows: any[],
    total: number
}
export interface ResultData {
    success: boolean,
    code: number,
    message: string,
    result: TableData | object
}