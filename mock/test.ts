import { map } from "lodash";

export default {
    'POST /api/test/init': {
        title: "测试模型",
        commands: [
            { command: "add", name: "新增" },
            { command: "edit", name: "编辑", isselectrow: true },
            { command: "remove", name: "删除", isselectrow: true, isalert: true, selectmultiple: true },
            { command: "test1", name: "测试1", isselectrow: true },
            { command: "save", name: "保存" },
            { command: "get", name: "获取" },
            { command: "test4", name: "测试4", issplit: true, splitname: "test2", isalert: true },
            { command: "test5", name: "测试5", issplit: true, splitname: "save", isselectrow: true },
            { command: "test6", name: "测试6", issplit: true, splitname: "save" },
        ],
        fields: [
            { field: 'name', title: '姓名', type: 'string', required: true, visible: true, isedit: true },
            { field: 'age', title: '年龄', type: 'int', required: true, visible: true, pointlength: 2, isedit: true },
            { field: 'born', title: '出生日期', type: 'datetime', visible: true, isedit: true },
            { field: 'ismirc', title: '是否已婚', type: 'boolean', required: true, visible: true, isedit: true },
            { field: 'city', title: '居住城市', type: 'int', required: true, visible: true, isedit: true, disabled: false, comvtp: { isvtp: true, items: [[0, '北京'], [1, '上海'], [2, '深圳'], [3, '成都']] } },
            { field: 'thing', title: '梦想', type: 'int', required: true, visible: true, isedit: true,
            foreign:{isfkey:true,OneObjecFiled:"id",} }
        ],
        childmodels: [{
            name: 'cars',
            title: '拥有车辆',
            visible: true,
            isadd: true,
            isedit: true,
            isremove: true,
            fields: [
                { field: 'brand', title: '品牌', type: 'string', visible: true, isedit: true },
                { field: 'type', title: '类型', type: 'string', visible: true, isedit: true },
                { field: 'oldage', title: '年份', type: 'string', visible: true, isedit: true }
            ]
        },
        {
            name: 'family',
            title: "家庭成员",
            visible:true,
            isadd:true,
            fields: [
                { field: 'name', title: '称呼', type: 'string', visible: true },
                { field: 'count', title: '数量', type: 'int', visible: true }
            ]
        }
        ]
    },
    'POST /api/test/search': {
        success: true,
        code: 200,
        statusText: "test",
        result: {
            rows: [
                {
                    id: 1, name: "X1", age: 24, "born": "2020-12-03", "ismirc": true, "city": 3, cars: [
                        { id: 1, brand: '雪铁龙', type: "C4", oldage: '2009' },
                        { id: 2, brand: '现代', type: "T6", oldage: '2012' }
                    ], family: [
                        { id: 1, name: '哥哥', count: 2 },
                        { id: 2, name: '姐姐', count: 1 },
                    ]
                },
                { id: 2, name: "X2", age: 27, "born": "2020-12-03", "ismirc": false, "city": 2 },
                { id: 3, name: "X3", age: 22, "born": "2020-12-03", "ismirc": true, "city": 1 },
                { id: 4, name: "X4", age: 13, "born": "2020-12-03", "ismirc": false, "city": 0 },
                { id: 5, name: "X5", age: 22, "born": "2020-12-03", "ismirc": true, "city": 2 },
                { id: 6, name: "X6", age: 26, "born": "2020-12-03", "ismirc": false, "city": 3 },
            ],
            total: 300
        }
    },
}
