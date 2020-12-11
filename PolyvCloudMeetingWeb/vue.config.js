/* eslint-disable */
module.exports = {
  lintOnSave: false,
  assetsDir: 'assets',
  devServer: {
    port: 15008,
    https: true,
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '^/api': {
        target: process.env.NODE_ENV === 'development' ? 'http://mt-api.polyv.net' : 'https://api.polyv.net/meeting',
        // target: process.env.NODE_ENV === 'development' ? 'http://mt-api.polyv.net' : 'http://mt-api.polyv.net',
        changeOrigin: true,
        onProxyRes(proxyRes) {
          const cookies = proxyRes.headers['set-cookie'];
          if (cookies) {
            const newCookie = cookies.map((item) => {
              return item.replace(/;\s*Domain=([^;])+/, '');
            });
            proxyRes.headers['set-cookie'] = newCookie;
          }
        },
        secure: false
      }
    }
  }
};
