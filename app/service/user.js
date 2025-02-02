const Service = require('egg').Service
class UserService extends Service {
  async getUserByName(username) {
    const { app } = this
    try {
      const result = await app.mysql.get('user', { username })
      return result
    } catch (e) {
      console.log(e)
      return null
    }
  }
  async register(params) {
    const { app } = this
    try {
      const result = await app.mysql.insert('user', params)
      return result
    } catch (e) {
      console.log(e)
      return null
    }
  }
  async editUserInfo(params) {
    const { ctx, app } = this
    try {
      const result = await app.mysql.update('user', { ...params }, { id: params.id })
      return result
    } catch (e) {
      console.log(e)
      return null
    }
    return null
    // return await app.mysql.update('user', params)
  }
}
module.exports = UserService
