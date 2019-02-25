// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const checkExist = async (db, collectionName) => {
    try {
        let count = await db.collection(collectionName).count()
        return true
    } catch(e) {
        if (e.errCode === -502005) {
            return false
        } else {
            throw e;
        }
    }
}
const create = async (db, collectionName) => {
    try {
        await db.createCollection(collectionName)
    } catch (e) {
        throw e;
    }
}
// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()
    const coltName = event.coltName
    const info = event.params
    if (info.date) info.date = new Date(info.date)
    try {
        let isExist = await checkExist(db, coltName)
        if (!isExist) await create(db, coltName)
        let res = await db.collection(coltName).add({ data: info })
        return {
            code: 0,
            message: '添加账单成功',
            info: res
        }
    } catch (e) {
        return {
            code: -500,
            message: e.message
        }
    }
}