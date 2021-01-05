import { SearchItem } from '@/components/Attribute';
import { DefaultModelType } from '@/components/WayPage/defaultModel';
import request from '@/utils/request';
const WayModel: DefaultModelType = {
    namespace: 'waydefault',
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
            const result = yield call(async () => await request(`/api/${args.payload}/init`, {
                method: 'POST'
            }))
            yield put({ type: "inited", value: result })
        },
        *search(args, { call, put }) {
            console.log('search')
            const result = yield call(async () => await request(`/api/${args.payload.c}/search`, {
                method: 'POST',
                data: args.payload.item
            }))
            console.log(result)
            yield put({ type: "searched", value: result, item: args.payload.item })
        },
        *execute(args, { call, put }) {
            const result = yield call(async () => await request(`/api/${args.payload.c}/${args.payload.command}`, {
                method: 'POST',
                data: args.payload.item
            }))
            yield put({ type: "executed", value: result })
        }
    },
    reducers: {
        inited(state, action) {
            var obj = { ...state }
            obj.model = action.value
            return obj
        },
        searched(state, action) {
            var item: SearchItem = action.item
            var result = action.value.result
            var obj = { ...state }
            if (item.field && item.foreign) {//外键查询
                obj.model?.fields?.forEach((f) => {
                    if (f.field == item.field?.field && f.foreign != undefined) {
                        f.foreign.model = result.model
                        f.foreign.data = result.data
                    }
                })
                return obj
            }
            if (item.parent && item.childmodel) {//子集查询

            }
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