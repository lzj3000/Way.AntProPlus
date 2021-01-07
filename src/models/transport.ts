import { DefaultModelType } from '@/components/WayPage/defaultModel';
import request from '@/utils/request';
const WayModel: DefaultModelType = {
    namespace: 'transport',
    state: {
        model: null,
        result: {
            success: true,
            code: 200,
            result: null,
            message: ''
        }
    },
    effects: {
        *init(args, { call, put }) {
            const result = yield call(async () => await request(`/api/${args.payload}/view`, {
                method: 'GET'
            }))
            yield put({ type: "inited", value: result })
        },
        *search(args, { call, put }) {
            var item = args.payload.item
            item.pageindex = item.page
            item.pagesize = item.size
            item.searchType = 0
            if (item.field && item.foreign) {//外键查询
                item.foreignfield = item.field
                item.searchType = 1
            }
            if (item.parent && item.childmodel) {//子集查询
                item.detailname = item.childmodel.name
                item.searchType = 2
            }
            const result = yield call(async () => await request(`/api/${args.payload.c}/find`, {
                method: 'POST',
                data: item
            }))
            if (item.searchType > 0) {
                return result
            }
            console.log(result)
            yield put({ type: "searched", value: result })
        },
        *execute(args, { call, put }) {
            var command = args.payload.command
            if (command == 'add') {
                command = "Create"
            }
            if (command == 'edit') {
                command = "Update"
            }
            if (command == 'remove') {
                command = "Remove"
            }
            const result = yield call(async () => await request(`/api/${args.payload.c}/${command}`, {
                method: 'POST',
                data: args.payload.item
            }))
            return result
            // yield put({ type: "executed", value: result })
        }
    },
    reducers: {
        inited(state, action) {
            var obj = { ...state }
            console.log(action.value)
            var result = action.value.result
            obj.model = {}
            obj.model.name = result.name
            obj.model.title = result.title
            obj.model.commands = result.commands
            obj.model.commands?.forEach((cmd) => {
                if (cmd.command == "Create")
                    cmd.command = "add"
                if (cmd.command == "Update")
                    cmd.command = "edit"
                if (cmd.command == "Remove")
                    cmd.command = "remove"
            })
            obj.model.fields = result.modelview.childitem
            obj.model.fields?.forEach((item) => {
                item.field = item.field?.toLocaleLowerCase()
                if (item.comvtp && item.comvtp.isvtp) {
                    var array = new Map<Number, String>()
                    for (var i in item.comvtp.items) {
                        array.set(Number(i), item.comvtp.items[i])
                    }
                    item.comvtp.items = array
                }
            })
            obj.model.childmodels = result.modelview.childmodel
            return obj
        },
        searched(state, action) {
            var obj = { ...state }
            obj.result = action.value
            return obj
        },
        executed(state, action) {
            var obj = { ...state }
            obj.result = action.value
            return obj
        }
    }
}
export default WayModel;