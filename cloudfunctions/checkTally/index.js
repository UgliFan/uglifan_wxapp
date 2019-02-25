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
    try {
        let isExist = await checkExist(db, coltName)
        if (!isExist) {
            await create(db, coltName)
            return {
                code: 0,
                message: '添加集合成功'
            }
        } else {
            return {
                code: 0,
                message: '集合存在'
            }
        }
    } catch (e) {
        return {
            code: -500,
            message: e.errMsg
        }
    }
}