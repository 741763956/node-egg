/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app
  const _jwt = middleware.jwtErr(app.config.jwt.secret)
  router.post('/api/user/register', controller.user.register)
  router.get('/api/user/login', controller.user.login)
  router.post('/api/upload', controller.upload.upload)
  router.post('/api/bill/add', _jwt, controller.bill.add); // 添加账单
  router.get('/api/bill/list', _jwt, controller.bill.list); // 获取账单列表
  router.get('/api/bill/detail', _jwt, controller.bill.detail); // 获取详情
  router.post('/api/bill/update', _jwt, controller.bill.update); // 账单更新
  router.post('/api/bill/delete', _jwt, controller.bill.delete); // 删除账单
  router.get('/api/bill/data', _jwt, controller.bill.data); // 获取数据
  router.post('/api/user/edit_userinfo', _jwt, controller.user.updateUserInfo); // 修改用户个性签名
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo); // 获取用户信息
  router.get('/api/user/test', _jwt, controller.user.test) // 放入第二个参数，作为中间件过滤项
}
