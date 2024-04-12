const { Controller } = require('egg')

class UserController extends Controller {
  async register() {
    const { ctx } = this
    const { username, password } = ctx.request.body
    // 判断是否已经存在
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '用户名或密码不能为空'
      }
      return
    }
    console.log(username, password, 'password')
    // 验证数据库内是否已经有该账户名
    const userInfo = await ctx.service.user.getUserByName(username) // 获取用户信息
    console.log(username, password, userInfo, 'password')
    // 判断是否已经存在
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账户名已被注册，请重新输入',
        data: null
      }
      return
    }
    // 默认头像，放在 user.js 的最外，部避免重复声明。
    const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'
    const result = await ctx.service.user.register({ username, password, signature: '世界和平', avatar: defaultAvatar })
    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null
      }
    }
  }
  async login() {
    const { ctx, app } = this
    // 获取用户名和密码
    const { username, password } = ctx.request.body
    console.log(username, password, 'password')
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '用户名或密码不能为空',
        data: null
      }
      return
    }
    // 根据用户名，在数据库查找相对应的id操作
    const userInfo = await ctx.service.user.getUserByName(username) // 获取用户信息
    let res = { code: 500, msg: '账号密码错误', data: {} }
    if (userInfo && userInfo.id) {
      // 判断密码是否正确
      if (userInfo.password !== password) {
        ctx.body = res
        return
      }
    } else {
      res.msg = '账号不存在'
      ctx.body = res
      return
    }
    // 登录成功后，将用户信息写入session
    console.log(userInfo, 'userInfo')
    const token = app.jwt.sign(
      {
        id: userInfo.id,
        username: userInfo.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // token 有效期为 24 小时
      },
      app.config.secret
    )
    console.log(token, 'token')
    userInfo.token = token
    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        userInfo
      }
    }
  }
  async test() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.secret)
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        ...decode
      }
    }
  }
  async getUserInfo() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    // 通过 app.jwt.verify 方法，解析出 token 内的用户信息
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    // 获取用户信息
    let userInfo = await ctx.service.user.getUserByName(decode.username)
    // userInfo 中应该有密码信息，所以我们指定下面四项返回给客户端
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar || defaultAvatar
      }
    }
  }
  async updateUserInfo() {
    const { ctx, app } = this
    // 通过 post 请求，在请求体中获取签名字段 signature
    const { signature = '', avatar = '' } = ctx.request.body

    try {
      let user_id
      const token = ctx.request.header.authorization
      // 解密 token 中的用户名称
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode) return
      user_id = decode.id
      // 通过 username 查找 userInfo 完整信息
      const userInfo = await ctx.service.user.getUserByName(decode.username)
      // 通过 service 方法 editUserInfo 修改 signature 信息。
      const result = await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar
      })

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: user_id,
          signature,
          username: userInfo.username,
          avatar
        }
      }
    } catch (error) {}
  }
}

module.exports = UserController
