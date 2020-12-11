import api from '@/assets/common/api/api';
import * as types from '../mutation-types';

export default {
  namespaced: true,

  state: {
    userInfo: {
      userId: '',
    }
  },

  actions: {
    async getUserInfo({ commit }) {
      const res = await api.post('/api/user/getUserInfo');
      if (res.data.code !== 200000) {
        throw res.data;
      }
      commit(types.GET_USER_INFO, res.data.data);
      return res.data;
    },
    async logout({ commit }) {
      // TODO: 填写正确的api
      await api.post('/api/user/logout');
      commit(types.USER_LOGOUT);
    }
  },

  mutations: {
    [types.GET_USER_INFO](state, v) {
      v.isLogin = !!v.userId;
      state.userInfo = v;
    },
    [types.USER_LOGOUT](state) {
      state.userInfo = { userId: '' };
    }
  }
};
