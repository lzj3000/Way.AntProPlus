import { DefaultModelType } from '@/components/WayPage/defaultModel';
import request from '@/utils/request';

const resultToModel = (result) => {
    var res = { success: result.success, data: null, message: result.message }
    if (res.success) {
        res.data = { rows: result.result.list, total: result.result.total }
        if (!result.result.view) return res
        var view = result.result.view
        if (!view.modelview)
            view.modelview = result.result.view
        if (view) {
            var model = {}
            model.name = view.name
            model.title = view.title
            model.commands = view.commands
            model.commands?.forEach((cmd) => {
                if (cmd.command == "Create")
                    cmd.command = "add"
                if (cmd.command == "Update")
                    cmd.command = "edit"
                if (cmd.command == "Remove")
                    cmd.command = "remove"
            })
            model.fields = itemToField(view.modelview.childitem)
            model.childmodels = view.modelview.childmodel
            model.childmodels.forEach((cm) => {
                cm.fields = itemToField(cm.childitem)
            })
            res.data.model = model
        }
    }
    return res
}
const itemToField = (items: any[]) => {
    items.forEach((item) => {
        item.field = item.field?.toLocaleLowerCase()
        if (item.comvtp && item.comvtp.isvtp) {
            var array = new Map<Number, String>()
            for (var i in item.comvtp.items) {
                array.set(Number(i), item.comvtp.items[i])
            }
            item.comvtp.items = array
        }
        if (item.foreign && item.foreign.isfkey) {
            for (var i in item.foreign) {
                if (typeof item.foreign[i] == 'string') {
                    item.foreign[i] = item.foreign[i].toLocaleLowerCase()
                }
            }
        }
    })
    return items
}
const WayModel: DefaultModelType = {
    namespace: 'transport',
    state:{},
    effects: {
        *init(args, { call, put }) {
            const result = yield call(async () => await request(`/api/${args.payload}/view`, {
                method: 'GET'
            }))
            result.result.view = result.result
            var obj = resultToModel(result)
           
            return obj
        },
        *search(args, { call, put }) {
            var item = args.payload.item
            item.pageindex = item.page ?? 1
            item.pagesize = item.size ?? 10
            item.searchType = 0
            if (item.sortList) {
                item.OrderbyList = item.sortList
            }
            console.log(item)
            item.IsShape = false
            if (item.field && item.foreign) {//外键查询
                item.foreignfield = item.field.field
                item.searchType = 4
            }
            if (item.parent && item.childmodel) {//子集查询
                item.detailname = item.childmodel.propertyname
                item.searchType = 2
                item.findId = item.parent.id
                console.log(item)
            }
            const result = yield call(async () => await request(`/api/${args.payload.c}/find`, {
                method: 'POST',
                data: item
            }))
            return resultToModel(result)
        },
        *execute(args, { call, put }) {
            var command = args.payload.command
            var m = "POST"
            if (command == 'add') {
                command = ""
            }
            if (command == 'edit') {
                command = args.payload.item.id
                m = "PUT"
            }
            if (command == 'remove') {
                command = ""
                m = "DELETE"
            }
            const result = yield call(async () => await request(`/api/${args.payload.c}/${command}`, {
                method: m,
                data: args.payload.item
            }))
            return result
        }
    }
}
export default WayModel;