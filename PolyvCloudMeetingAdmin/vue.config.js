module.exports = {
  lintOnSave: false,
  assetsDir: 'assets',
  devServer: {
    port: 15005,
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '^/api': {
        // target: process.env.NODE_ENV === 'development' ? 'http://localhost:8190' : 'http://mt-manage.polyv.net',
        target: process.env.NODE_ENV === 'development' ? 'http://mt-manage.polyv.net' : 'http://meeting.polyv.net',
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
