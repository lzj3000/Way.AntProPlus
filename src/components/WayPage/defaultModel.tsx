import { ModelAttribute, ResultData } from "../Attribute";
import { Effect } from "dva";
import { Reducer } from "umi";

export interface DefaultModelState {
    model: ModelAttribute | null,
    result: ResultData | null,
}
export interface DefaultModelType {
    namespace: string,
    state: DefaultModelState,
    effects: {
        init: Effect,
        search: Effect,
        execute: Effect,
    },
    reducers: {
        inited: Reducer<DefaultModelState>;
        searched: Reducer<DefaultModelState>;
        executed: Reducer<DefaultModelState>;
    }
}
