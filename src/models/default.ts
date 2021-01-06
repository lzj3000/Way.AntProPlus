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
            var item=args.payload.item
            const result = yield call(async () => await request(`/api/${args.payload.c}/search`, {
                method: 'POST',
                data: item
            }))
            if (item.field && item.foreign) {//外键查询
                return result
            }
            if (item.parent && item.childmodel) {//子集查询
                return result
            }
            yield put({ type: "searched", value: result})
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