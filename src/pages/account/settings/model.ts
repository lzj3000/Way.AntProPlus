import { Effect, Reducer } from 'umi';
import { CurrentUser, GeographicItemType } from './data.d';
import { queryCity, queryCurrent, queryProvince, query as queryUsers, setpassword } from './service';

export interface ModalState {
  currentUser?: Partial<CurrentUser>;
  province?: GeographicItemType[];
  city?: GeographicItemType[];
  isLoading?: boolean;
}

export interface ModelType {
  namespace: string;
  state: ModalState;
  effects: {
    fetchCurrent: Effect;
    fetch: Effect;
    fetchProvince: Effect;
    fetchCity: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<ModalState>;
    changeNotifyCount: Reducer<ModalState>;
    setProvince: Reducer<ModalState>;
    setCity: Reducer<ModalState>;
    changeLoading: Reducer<ModalState>;
  };
}

const Model: ModelType = {
  namespace: 'accountAndsettings',

  state: {
    currentUser: {},
    province: [],
    city: [],
    isLoading: false,
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      try {
        const response = yield call(queryCurrent);
        console.log(response)
        if (response.success) {
          var user = {
            name: response.result.name,
            avatar: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
            email: response.result.email,
            phone: response.result.phone
          }
          yield put({
            type: 'saveCurrentUser',
            payload: user,
          });
        } else {
        
        }
      }
      catch {
        //window.location.href = '/user/login'
      }
    },
    *fetchProvince(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryProvince);
      yield put({
        type: 'setProvince',
        payload: response,
      });
    },
    *fetchCity({ payload }, { call, put }) {
      const response = yield call(queryCity, payload);
      yield put({
        type: 'setCity',
        payload: response,
      });
    },
    *fetchSetPassword({ payload }, { call, put }) {
      const response = yield call(setpassword, payload);
      return response
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      console.log(state)
      console.log('saveCurrentUser')
      console.log(action.payload)
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state = {}, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
    setProvince(state, action) {
      return {
        ...state,
        province: action.payload,
      };
    },
    setCity(state, action) {
      return {
        ...state,
        city: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
  },
};

export default Model;
