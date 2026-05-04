import axios from 'axios';
import qs from 'qs';

const api = axios.create({
  baseURL: '', //'http://31.131.192.7:8080', //process.env.REACT_APP_API_BASE_URL,
  xsrfCookieName: 'CSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: true,
  timeout: 120 * 1000,

  paramsSerializer: function (params) {
    return qs.stringify(params, {
      arrayFormat: 'brackets',
    });
  },
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (r) {
    if (r.response && r.response.status === 401) {
      throw 'Неверный логин/пароль';
    }
    return Promise.reject(r);
  },
);

class Rest {
  constructor(params) {
    this.params = Object.assign(
      {
        url: '',
        method: 'GET',
        type: 'json',
        data: {},
        cancelToken: new axios.CancelToken((c) => {
          this.canceler = c;
        }),
      },
      params,
    );
  }

  static get(url, data = {}) {
    return new Rest({ url, ...data });
  }

  static delete(url, data = {}) {
    return new Rest({ method: 'DELETE', url, data });
  }

  static post(url, data = {}) {
    return new Rest({ method: 'POST', url, data });
  }

  static put(url, data = {}) {
    return new Rest({ method: 'PUT', url, data });
  }

  then(callback = () => {}) {
    api
      .request(this.params)
      .then(callback)
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Rest catch]', error);
        }
        if (!axios.isCancel(error)) {
          this.callCatch(error);
        }
      })
      .finally(() => {
        this.callFinally();
      });
    return this;
  }

  callCatch(json) {
    if (this.params['catchCallback']) {
      this.params['catchCallback'](json);
    } else {
      this.params['catchResult'] = json;
    }
    return this;
  }

  callFinally() {
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  catch(callback) {
    if (this.params['catchResult']) {
      callback(this.params['catchResult']);
    } else {
      this.params['catchCallback'] = callback;
    }
    return this;
  }

  finally(callback) {
    this.finallyCallback = callback;
    return this;
  }

  cancel() {
    if (this.canceler) {
      this.canceler();
    }
  }
}

export default Rest;
