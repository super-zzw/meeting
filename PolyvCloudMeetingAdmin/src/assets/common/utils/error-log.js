const log = {
  // 常用
  e0: '成功',
  e9: '未知错误',
  e11: '未登录',
  e12: '禁止访问（权限错误）',
  e20: '频道ID或密码错误',

  // 参数校验错误
  e1100: '参数校验错误',
  e1110: '参数值为空',
  e1111: '参数值不是非负整数',
  e1112: '参数值不是数字',
  e1113: '参数值长度不正确',
  e1114: '数值范围错误',
  e1115: '参数不是 json',
  e1116: '时间毫秒值错误',
  e1121: '参数不是颜色值',
  e1122: '参数不是布尔值（Y或N）',
  e1123: '参数不是正确的yyyy-MM-dd日期格式 ',
  e1126: '日期范围错误',

  e1180: '错误的后台角色类型',
  e1190: '错误的聊天室房间号',

  e1200: '错误的频道列表排序值',
  e1201: '错误的直播场景',
  e1202: '错误的频道菜单类型',
  e1203: '页面菜单已经存在',
  e1204: '页面菜单数达到上限',
  e1205: '非法的频道页面菜单ID',
  e1206: '跑马灯类型错误',
  e1207: '错误的播放器logo图片位置',
  e1208: '错误的直播播放器皮肤值',
  e1209: '直播方式流类型错误',
  e1210: '错误的暖场类型',
  e1220: '新密码和确认密码不一致',
  e1221: '旧密码错误',

  e1231: '错误的打赏类型',
  e1232: '错误的广告类型（页面，片头，暂停）',
  e1233: '错误的广告类型（图片，视频）',

  e1240: '错误的收入类型',
  e1250: '错误的观看日志类型',

  e1300: '上传的文件大小超过限制',
  e1301: '上传的文件格式错误',

  // 业务校验错误
  e5100: '业务校验错误',
  e5110: '非法的频道ID',
  e5112: '频道已停用',
  e5120: '图片验证码错误',
  e5121: '短信验证码错误',
  e5122: '短信验证码发送频繁',

  e5200: '频道数达到上限',

  e5210: '非法的频道分类ID',
  e5211: '频道分类数达到上限',
  e5212: '已存在同名的频道分类',
  e5216: '非法的频道菜单ID',
  e5217: '错误的频道菜单列表信息',

  e5220: '错误的播放器皮肤',
  e5221: '错误的播放器颜色',
  e5222: '错误的播放器logo图片地址',
  e5223: '错误的播放器logo图片透明度',
  e5224: '错误的播放器logo位置',
  e5225: '错误的播放器logo点击跳转地址',
  e5226: '错误的直播开始时间',

  e5230: '视频ID错误',
  e5231: '添加硬盘推流视频，不能添加加密视频',
  e5232: '添加硬盘推流视频，播放时间错误（为过去的时间）',
  e5233: '添加硬盘推流视频，播放时间段有冲突',
  e5234: '删除硬盘推流视频，无法删除直播中的视频',
  e5235: '当前流类型不是拉流，无法进行操作',
  e5236: '正在直播中，请停止直播后重试',
  e5237: '登记观看字段类型错误',
  e5238: '观看条件类型错误',
  e5239: '登记观看没有创建登记字段',

  e5240: '登记观看没有勾选登记字段',
  e5241: '提交字段信息不完整（各字段信息数组长度不一致）',
  e5242: '名字类型的字段最多只有一个',
  e5243: '当前白名单列表为空',
  e5244: '请使用模板进行白名单上传',
  e5245: '上传的白名单表格中没有数据',
  e5246: '主要观看条件错误（不能为分享观看）',
  e5247: '次要观看条件错误（次要条件不能为自定义授权观看和外部授权观看）',
  e5248: '主要观看条件和次要观看条件不能相同（除无限制观看条件外）',
  e5249: '主要条件为自定义授权或者外部授权时，不能设置次要观看条件',

  e5250: '非法的子频道号',
  e5251: '子频道的数量达到上限',
  e5255: '邀请卡，已存在相同的关键词',

  e5260: '直播用户的点播账号不存在',
  e5261: '点播账号已过期',
  e5262: '点播账号空间不足',
  e5263: '录制视频不存在',
  e5264: '录制视频转存失败',
  e5265: '合并的录制视频格式错误',
  e5266: '录制文件无法合并',
  e5267: 'm3u8格式录制视频还未生成，无法转存',
  e5268: '录制视频已转存',
  e5269: '点播视频已经添加到回放列表',

  e5270: '回放视频ID错误',
  e5271: '回放视频序号在边界（最前或最后），无法上移/下移',
  e5272: '回放视频不存在',
  e5275: '当前是直播状态，不可开启测试模式',

  e5280: '非法功能开关类型',

  e5300: '上传的严禁词表格解析错误',
  e5301: '上传的严禁词表格中没有数据',

  e5520: '提现订单号错误',
  e5521: '账户被冻结',
  e5522: '提现金额错误，低于1000或高于余额',
  e5523: '尚未绑定银行卡信息',
  e5524: '提现次数超过限制（每月一次）',
  e5525: '已经绑定过银行卡信息',
  e5526: '提现日期错误',
  e5527: '主频道已经在推流，不允许切流',
  e5552: '该回放视频已失效',
  e5554: '该重制课件任务已存在',
  e5581: '要切换的cdn类型不存在',
};

export default function errorLog(code) {
  if (typeof code !== 'number') {
    return '网络异常,请检查网络后重试';
  }
  return log[`e${code}`] || '未知错误';
}
